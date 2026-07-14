/**
 * scripts/snapshot.ts
 *
 * Captura la cadena de opciones de IOL y la persiste en Supabase.
 *
 * Estrategia de datos (dos pasos):
 *  1. GET /api/v2/titulos/{sym}/opciones?mercado=bCBA
 *     → lista de contratos. LIMITACIÓN: .cotizacion tiene puntas=null.
 *  2. GET /api/v2/titulos/{ticker}/cotizacion?mercado=bCBA  (por cada near-money)
 *     → cotización real con puntas (bid/ask), volumen intradiario, OHLC.
 *     Solo se hace para opciones near-the-money (±NEAR_MONEY_PCT del spot),
 *     limitado a MAX_COTIZACIONES, para controlar el consumo mensual de API.
 *
 * GUARDRAIL: se consulta el uso acumulado del mes actual en Supabase ANTES de
 * hacer calls a IOL. Si el run proyectado superaría el límite duro, se aborta
 * sin consumir API y se registra como "aborted".
 *
 * Límite bonificado: 25.000 calls/mes.
 * Límite duro configurado: CALL_HARD_LIMIT (default 24.500 = 98%).
 *
 * Uso local:
 *   pnpm snapshot              # captura y guarda
 *   pnpm snapshot --dry-run    # muestra info del run sin guardar ni contar
 *
 * Variables de entorno (.env en raíz del monorepo, o secrets en GitHub Actions):
 *   IOL_USERNAME, IOL_PASSWORD
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   SNAPSHOT_UNDERLYING     (default: GGAL)
 *   SNAPSHOT_RATE           (default: 0.35)
 *   SNAPSHOT_NEAR_MONEY_PCT (default: 0.25 → ±25% del spot)
 *   SNAPSHOT_MAX_COTIZACIONES (default: 50 → máximo de cotizaciones individuales por run)
 *   CALL_HARD_LIMIT         (default: 24500 → abortar si el run lo superaría)
 */

import "dotenv/config";
import {
  parseTicker,
  expirationFromMonthCode,
  type OptionContract,
  type OptionQuote,
  type ChainSnapshot,
} from "@opciones/data";

// ─── Config ──────────────────────────────────────────────────────────────────

const IOL_BASE       = "https://api.invertironline.com";
const SUPABASE_URL   = required("SUPABASE_URL");
const SUPABASE_KEY   = required("SUPABASE_SERVICE_ROLE_KEY");
const IOL_USER       = required("IOL_USERNAME");
const IOL_PASS       = required("IOL_PASSWORD");
const UNDERLYING     = process.env.SNAPSHOT_UNDERLYING     ?? "GGAL";
const RATE           = parseFloat(process.env.SNAPSHOT_RATE ?? "0.35");
const NEAR_MONEY_PCT = parseFloat(process.env.SNAPSHOT_NEAR_MONEY_PCT   ?? "0.25");
const MAX_COTIZACIONES = parseInt(process.env.SNAPSHOT_MAX_COTIZACIONES ?? "50");
const CALL_HARD_LIMIT  = parseInt(process.env.CALL_HARD_LIMIT            ?? "24500");
const BATCH_SIZE     = 30; // requests IOL paralelos por lote
const DRY_RUN        = process.argv.includes("--dry-run");

// Calls IOL fijos por run: login (1) + spot (1) + opciones-list (1)
const FIXED_IOL_CALLS = 3;

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Variable de entorno requerida: ${key}`);
  return v;
}

// ─── IOL Auth + fetch ─────────────────────────────────────────────────────────

async function iolLogin(): Promise<string> {
  const body = new URLSearchParams({
    username: IOL_USER,
    password: IOL_PASS,
    grant_type: "password",
  });
  const res = await fetch(`${IOL_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IOL login falló ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function iolGet(path: string, token: string): Promise<unknown> {
  const res = await fetch(`${IOL_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IOL GET ${path} falló ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pos(v: unknown): number | null {
  const n = num(v);
  return n !== null && n > 0 ? n : null;
}

function extractSpot(raw: unknown): number {
  const r = raw as Record<string, unknown>;
  for (const c of [r.ultimoPrecio, r.ultimo, r.last, r.precio]) {
    const n = pos(c);
    if (n) return n;
  }
  throw new Error(
    `No se pudo extraer spot. Respuesta:\n${JSON.stringify(raw, null, 2).slice(0, 400)}`,
  );
}

// ─── Contratos ────────────────────────────────────────────────────────────────

function parseContracts(
  rawOptions: unknown[],
  underlying: string,
  date: string,
): OptionContract[] {
  const contracts: OptionContract[] = [];
  let skipped = 0;

  for (const raw of rawOptions) {
    const r = raw as Record<string, unknown>;
    const rawTicker = String(r.simbolo ?? r.symbol ?? r.ticker ?? "").trim().toUpperCase();
    if (!rawTicker) { skipped++; continue; }

    const parsed = parseTicker(rawTicker);
    if (!parsed || parsed.underlying !== underlying) { skipped++; continue; }

    const expiration = expirationFromMonthCode(parsed.monthCode, date);
    if (!expiration) { skipped++; continue; }

    contracts.push({
      ticker:     parsed.ticker,
      underlying: parsed.underlying,
      optionType: parsed.optionType,
      strike:     parsed.strike,
      expiration,
      monthCode:  parsed.monthCode,
      lotSize:    100,
    });
  }

  if (skipped > 0) {
    console.warn(`[snapshot] ${skipped} contratos omitidos (ticker inválido o subyacente diferente)`);
  }
  return contracts;
}

// ─── Cotizaciones individuales ────────────────────────────────────────────────

type RawCotizacion = {
  ultimoPrecio?:     number;
  volumenNominal?:   number;
  interesesAbiertos?: number;
  puntas?: Array<{ precioCompra: number; precioVenta: number }> | null;
};

function quoteFromCotizacion(
  ticker: string,
  ts: string,
  raw: RawCotizacion | null,
): OptionQuote {
  if (!raw) {
    return { ticker, ts, bid: null, ask: null, last: null, volume: 0, openInterest: null };
  }
  const best = raw.puntas?.[0] ?? null;
  return {
    ticker,
    ts,
    bid:          best ? pos(best.precioCompra) : null,
    ask:          best ? pos(best.precioVenta)  : null,
    last:         pos(raw.ultimoPrecio),
    volume:       num(raw.volumenNominal) ?? 0,
    openInterest: num(raw.interesesAbiertos),
  };
}

async function fetchQuotes(
  tickers: string[],
  token: string,
  ts: string,
): Promise<{ quotes: OptionQuote[]; callsMade: number }> {
  const quotes: OptionQuote[] = [];
  let callsMade = 0;
  let withPuntas = 0;

  for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
    const batch = tickers.slice(i, i + BATCH_SIZE);
    const fetched = await Promise.all(
      batch.map(async (ticker) => {
        try {
          const raw = (await iolGet(
            `/api/v2/titulos/${ticker}/cotizacion?mercado=bCBA`,
            token,
          )) as RawCotizacion;
          callsMade++;
          return { ticker, raw };
        } catch (err) {
          console.warn(`[snapshot] cotizacion de ${ticker} falló:`, (err as Error).message);
          return { ticker, raw: null };
        }
      }),
    );

    for (const { ticker, raw } of fetched) {
      const q = quoteFromCotizacion(ticker, ts, raw);
      quotes.push(q);
      if (q.bid !== null || q.ask !== null) withPuntas++;
    }

    console.log(
      `[snapshot] cotizaciones ${Math.min(i + BATCH_SIZE, tickers.length)}/${tickers.length} — ${withPuntas} con puntas`,
    );
  }

  return { quotes, callsMade };
}

// ─── Supabase ─────────────────────────────────────────────────────────────────

function supabaseHeaders() {
  return {
    "Content-Type": "application/json",
    apikey:         SUPABASE_KEY,
    Authorization:  `Bearer ${SUPABASE_KEY}`,
    Accept:         "application/json",
  };
}

async function getMonthCalls(month: string): Promise<number> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/snapshot_runs?month=eq.${month}&select=calls_total`,
      { headers: supabaseHeaders() },
    );
    if (!res.ok) return 0;
    const rows = (await res.json()) as Array<{ calls_total: number }>;
    return rows.reduce((sum, r) => sum + (r.calls_total ?? 0), 0);
  } catch {
    return 0; // si la tabla no existe aún, no bloqueamos
  }
}

async function logRun(run: {
  month:           string;
  calls_total:     number;
  contracts_total: number;
  with_puntas:     number;
  spot:            number | null;
  status:          "ok" | "aborted" | "error";
  notes?:          string;
}): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/snapshot_runs`, {
      method: "POST",
      headers: { ...supabaseHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ ...run, underlying: UNDERLYING }),
    });
  } catch (err) {
    console.warn("[snapshot] No se pudo registrar el run:", (err as Error).message);
  }
}

async function upsertChain(snapshot: ChainSnapshot, ts: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/chain_snapshots`, {
    method: "POST",
    headers: { ...supabaseHeaders(), Prefer: "resolution=ignore-duplicates" },
    body: JSON.stringify({
      underlying:    snapshot.underlying,
      snapshot_date: snapshot.date,
      ts,
      spot:          snapshot.spot,
      rate:          snapshot.rate,
      contracts:     snapshot.contracts,
      quotes:        snapshot.quotes,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase upsert falló ${res.status}: ${err.slice(0, 400)}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const ts    = new Date().toISOString();
  const month = ts.slice(0, 7); // YYYY-MM
  const date  = ts.slice(0, 10);

  console.log(
    `[snapshot] underlying=${UNDERLYING} rate=${RATE} near_money=±${(NEAR_MONEY_PCT * 100).toFixed(0)}% max_cotizaciones=${MAX_COTIZACIONES} dry-run=${DRY_RUN}`,
  );

  // ── Guardrail: verificar límite mensual ANTES de consumir API ──────────────
  if (!DRY_RUN) {
    const monthCalls = await getMonthCalls(month);
    const estimatedRun = FIXED_IOL_CALLS + MAX_COTIZACIONES;
    const projected    = monthCalls + estimatedRun;

    console.log(
      `[snapshot] uso acumulado ${month}: ${monthCalls} calls | este run: ~${estimatedRun} | total proyectado: ${projected} / ${CALL_HARD_LIMIT}`,
    );

    if (projected > CALL_HARD_LIMIT) {
      console.warn(
        `[snapshot] ⚠️  ABORTADO — superaría el límite (${projected} > ${CALL_HARD_LIMIT})`,
      );
      await logRun({
        month,
        calls_total:     0,
        contracts_total: 0,
        with_puntas:     0,
        spot:            null,
        status:          "aborted",
        notes:           `Proyectado ${projected} > límite ${CALL_HARD_LIMIT} (acumulado mes: ${monthCalls})`,
      });
      process.exit(0);
    }
  }

  // ── Paso 1: auth + spot + lista de contratos ───────────────────────────────
  const token = await iolLogin();
  console.log("[snapshot] IOL auth OK");

  const rawSpot = await iolGet(
    `/api/v2/titulos/${UNDERLYING}/cotizacion?mercado=bCBA`,
    token,
  );
  const spot = extractSpot(rawSpot);
  console.log(`[snapshot] spot=${spot}`);

  const rawOpciones = await iolGet(
    `/api/v2/titulos/${UNDERLYING}/opciones?mercado=bCBA`,
    token,
  );
  const optionsArray: unknown[] = Array.isArray(rawOpciones)
    ? rawOpciones
    : ((rawOpciones as Record<string, unknown>)?.opciones as unknown[]) ?? [];

  if (optionsArray.length === 0) {
    throw new Error("IOL devolvió 0 opciones — ¿mercado cerrado o endpoint incorrecto?");
  }

  const contracts = parseContracts(optionsArray, UNDERLYING, date);
  console.log(`[snapshot] contratos parseados: ${contracts.length}`);

  // ── Near-money filter: seleccionar qué tickers cotizar individualmente ──────
  const nearMoney = contracts
    .filter((c) => Math.abs(c.strike - spot) / spot <= NEAR_MONEY_PCT)
    .slice(0, MAX_COTIZACIONES);

  const farOtm = contracts.filter((c) => !nearMoney.includes(c));

  console.log(
    `[snapshot] near-money (±${(NEAR_MONEY_PCT * 100).toFixed(0)}%): ${nearMoney.length} | far OTM/ITM (stale): ${farOtm.length}`,
  );

  if (DRY_RUN) {
    console.log("\n─── Near-money tickers (se cotizarán individualmente) ───");
    nearMoney.slice(0, 6).forEach((c) =>
      console.log(` ${c.ticker.padEnd(16)} strike=${c.strike} monthCode=${c.monthCode}`),
    );
    console.log(`  ... (${nearMoney.length} total)`);
    console.log("\n─── Ejemplo cotizacion individual (primer near-money) ───");
    if (nearMoney.length > 0) {
      const sample = (await iolGet(
        `/api/v2/titulos/${nearMoney[0].ticker}/cotizacion?mercado=bCBA`,
        token,
      )) as Record<string, unknown>;
      const { ultimoPrecio, volumenNominal, variacion, puntas, fechaHora } = sample;
      console.log(JSON.stringify({ ultimoPrecio, volumenNominal, variacion, fechaHora, puntas_niveles: Array.isArray(puntas) ? puntas.length : 0 }, null, 2));
    }
    process.exit(0);
  }

  // ── Paso 2: cotizaciones individuales near-money ───────────────────────────
  const { quotes: nearMoneyQuotes, callsMade } = await fetchQuotes(
    nearMoney.map((c) => c.ticker),
    token,
    ts,
  );

  // Para los far OTM/ITM usamos el dato del endpoint /opciones (que tiene
  // ultimoPrecio stale pero no consume calls adicionales).
  const quoteMap = new Map(nearMoneyQuotes.map((q) => [q.ticker, q]));
  const farQuotesFromOpciones: OptionQuote[] = farOtm.map((c) => {
    const rawFar = optionsArray.find(
      (r) => String((r as Record<string, unknown>).simbolo ?? "").toUpperCase() === c.ticker,
    ) as Record<string, unknown> | undefined;
    const cot = (rawFar?.cotizacion ?? {}) as Record<string, unknown>;
    return {
      ticker:       c.ticker,
      ts,
      bid:          null,
      ask:          null,
      last:         pos(cot.ultimoPrecio),
      volume:       num(cot.volumenNominal) ?? 0,
      openInterest: num((cot as Record<string, unknown>).interesesAbiertos),
    };
  });

  const allQuotes = [
    ...nearMoneyQuotes,
    ...farQuotesFromOpciones.filter((q) => !quoteMap.has(q.ticker)),
  ];

  const withBid    = allQuotes.filter((q) => q.bid !== null).length;
  const withVol    = allQuotes.filter((q) => q.volume > 0).length;
  const totalCalls = FIXED_IOL_CALLS + callsMade;

  const snapshot: ChainSnapshot = {
    underlying: UNDERLYING,
    date,
    spot,
    rate: RATE,
    contracts,
    quotes: allQuotes,
  };

  await upsertChain(snapshot, ts);

  await logRun({
    month,
    calls_total:     totalCalls,
    contracts_total: contracts.length,
    with_puntas:     withBid,
    spot,
    status:          "ok",
    notes:           `near=${nearMoney.length} far=${farOtm.length} vol=${withVol}`,
  });

  console.log(
    `[snapshot] ✓ guardado — ${contracts.length} contratos | ${withBid} con bid | ${withVol} con vol | ${totalCalls} calls IOL este run`,
  );
}

main().catch(async (err: Error) => {
  console.error("[snapshot] ERROR:", err.message);
  const ts    = new Date().toISOString();
  const month = ts.slice(0, 7);
  await logRun({
    month,
    calls_total:     0,
    contracts_total: 0,
    with_puntas:     0,
    spot:            null,
    status:          "error",
    notes:           err.message.slice(0, 500),
  });
  process.exit(1);
});
