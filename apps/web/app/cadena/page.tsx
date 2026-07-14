import { createClient } from "@/utils/supabase/server";
import { ChainSnapshotSchema, type ChainSnapshot } from "@opciones/data";
import { impliedVol } from "@opciones/core";
import Link from "next/link";
import { TriggerButton } from "@/components/TriggerButton";

export const metadata = { title: "Cadena — Opciones BYMA" };
export const revalidate = 60; // ISR: reconstruye cada 60s

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000,
  );
}

function fmt(n: number | null | undefined, dec = 2): string {
  if (n == null) return "—";
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

function fmtIv(iv: number | null): string {
  if (iv === null) return "—";
  return (iv * 100).toFixed(1) + "%";
}

/** Convierte un timestamp UTC a hora local de Argentina (UTC-3, sin DST). */
function fmtArgTime(ts: string): string {
  return new Date(ts).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Row = {
  strike: number;
  isAtm: boolean;
  isCallItm: boolean;
  isPutItm: boolean;
  callBid: number | null;
  callAsk: number | null;
  callLast: number | null;
  callVol: number;
  callIv: number | null;
  putBid: number | null;
  putAsk: number | null;
  putLast: number | null;
  putVol: number;
  putIv: number | null;
};

function buildRows(snapshot: ChainSnapshot, monthCode: string): Row[] {
  const expiration =
    snapshot.contracts.find((c) => c.monthCode === monthCode)?.expiration ?? "";
  const dte = daysBetween(snapshot.date, expiration);
  const t = dte / 365;

  const contracts = snapshot.contracts.filter((c) => c.monthCode === monthCode);
  const quoteMap = new Map(snapshot.quotes.map((q) => [q.ticker, q]));
  const callMap = new Map<number, string>();
  const putMap = new Map<number, string>();
  const strikes = new Set<number>();

  for (const c of contracts) {
    strikes.add(c.strike);
    if (c.optionType === "call") callMap.set(c.strike, c.ticker);
    else putMap.set(c.strike, c.ticker);
  }

  const sortedStrikes = [...strikes].sort((a, b) => a - b);
  const atmStrike = sortedStrikes.reduce((prev, curr) =>
    Math.abs(curr - snapshot.spot) < Math.abs(prev - snapshot.spot)
      ? curr
      : prev,
  );

  const base = { spot: snapshot.spot, rate: snapshot.rate, timeToExpiry: t };

  return sortedStrikes.map((strike) => {
    const cq = callMap.has(strike)
      ? quoteMap.get(callMap.get(strike)!)
      : undefined;
    const pq = putMap.has(strike)
      ? quoteMap.get(putMap.get(strike)!)
      : undefined;

    const callLast = cq?.last ?? null;
    const putLast = pq?.last ?? null;

    return {
      strike,
      isAtm: strike === atmStrike,
      isCallItm: strike < snapshot.spot,
      isPutItm: strike > snapshot.spot,
      callBid: cq?.bid ?? null,
      callAsk: cq?.ask ?? null,
      callLast,
      callVol: cq?.volume ?? 0,
      callIv:
        callLast != null
          ? impliedVol({ ...base, type: "call", strike }, callLast)
          : null,
      putBid: pq?.bid ?? null,
      putAsk: pq?.ask ?? null,
      putLast,
      putVol: pq?.volume ?? 0,
      putIv:
        putLast != null
          ? impliedVol({ ...base, type: "put", strike }, putLast)
          : null,
    };
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CadenaPage({
  searchParams,
}: {
  searchParams: Promise<{ monthCode?: string }>;
}) {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("chain_snapshots")
    .select("*")
    .eq("underlying", "GGAL")
    .order("ts", { ascending: false })
    .limit(1)
    .single();

  if (error || !row) {
    return (
      <div className="space-y-4 py-12 text-center text-slate-500">
        <p className="text-lg">Sin snapshots disponibles.</p>
        <p className="text-sm">
          Ejecutá <code>pnpm snapshot</code> para capturar datos de IOL.
        </p>
      </div>
    );
  }

  const snapshot = ChainSnapshotSchema.parse({
    underlying: row.underlying,
    date: row.snapshot_date,
    spot: Number(row.spot),
    rate: Number(row.rate),
    contracts: row.contracts,
    quotes: row.quotes,
  });

  // Orden del ciclo bimestral de BYMA (soporta variantes de 1 letra)
  const MONTH_ORDER: Record<string, number> = {
    FE: 2, F: 2, AB: 4, A: 4, JU: 6, J: 6,
    AG: 8, G: 8, OC: 10, O: 10, DI: 12, D: 12,
  };

  // Deduplicar por mes (preferir 2 letras sobre 1: JU > J) y ordenar cronológicamente
  const allCodes = [...new Set(snapshot.contracts.map((c) => c.monthCode))];
  const seenMonths = new Set<number>();
  const monthCodes = allCodes
    .sort((a, b) => {
      const diff = (MONTH_ORDER[a] ?? 99) - (MONTH_ORDER[b] ?? 99);
      if (diff !== 0) return diff;
      return b.length - a.length; // JU antes que J para el mismo mes
    })
    .filter((code) => {
      const m = MONTH_ORDER[code] ?? 99;
      if (seenMonths.has(m)) return false;
      seenMonths.add(m);
      return true;
    });

  const { monthCode: selectedCode } = await searchParams;
  // Default: más lejano disponible (el más útil para aprender)
  const monthCode = monthCodes.includes(selectedCode ?? "")
    ? selectedCode!
    : (monthCodes.at(-1) ?? "");

  const expiration =
    snapshot.contracts.find((c) => c.monthCode === monthCode)?.expiration ?? "";
  const dte = daysBetween(snapshot.date, expiration);
  const rows = buildRows(snapshot, monthCode);
  const snapshotTime = fmtArgTime(row.ts);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cadena de opciones</h1>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
            <span>
              Subyacente: <strong className="text-slate-900">GGAL</strong>
            </span>
            <span>
              Spot:{" "}
              <strong className="text-slate-900">
                ${fmt(snapshot.spot, 0)}
              </strong>
            </span>
            <span>
              Vencimiento:{" "}
              <strong className="text-slate-900">
                {monthCode} · {expiration}
              </strong>
            </span>
            <span>
              DTE: <strong className="text-slate-900">{dte} días</strong>
            </span>
            <span>
              Tasa:{" "}
              <strong className="text-slate-900">
                {(snapshot.rate * 100).toFixed(1)}%
              </strong>
            </span>
          </div>
          {/* Timestamp + botón actualizar */}
          <div className="mt-1 flex items-center gap-3">
            <p className="text-xs text-slate-400">
              Snapshot: {snapshotTime} hs (ARG)
            </p>
            <TriggerButton variant="compact" />
          </div>
        </div>

        {/* Selector de vencimiento */}
        {monthCodes.length > 1 && (
          <div className="flex gap-2">
            {monthCodes.map((code) => (
              <Link
                key={code}
                href={`/cadena?monthCode=${code}`}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  code === monthCode
                    ? "bg-slate-800 text-white"
                    : "border border-slate-200 text-slate-600 hover:border-slate-400"
                }`}
              >
                {code}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase tracking-wide">
              <th
                colSpan={5}
                className="border-b border-r border-slate-200 py-2 text-center text-blue-600"
              >
                Calls
              </th>
              <th className="border-b border-slate-200 px-4 py-2 text-center text-slate-500">
                Base
              </th>
              <th
                colSpan={5}
                className="border-b border-l border-slate-200 py-2 text-center text-rose-600"
              >
                Puts
              </th>
            </tr>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
              <th className="py-1.5 pr-3 pl-4 text-right">IV</th>
              <th className="px-3 py-1.5 text-right">Último</th>
              <th className="px-3 py-1.5 text-right">Ask</th>
              <th className="px-3 py-1.5 text-right">Bid</th>
              <th className="border-r border-slate-200 py-1.5 pr-4 pl-3 text-right">
                Vol
              </th>
              <th className="px-4 py-1.5 text-center font-semibold text-slate-700">
                —
              </th>
              <th className="border-l border-slate-200 py-1.5 pr-3 pl-4 text-left">
                Vol
              </th>
              <th className="px-3 py-1.5 text-left">Bid</th>
              <th className="px-3 py-1.5 text-left">Ask</th>
              <th className="px-3 py-1.5 text-left">Último</th>
              <th className="py-1.5 pr-4 pl-3 text-left">IV</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(
              ({
                strike,
                isAtm,
                isCallItm,
                isPutItm,
                callBid,
                callAsk,
                callLast,
                callVol,
                callIv,
                putBid,
                putAsk,
                putLast,
                putVol,
                putIv,
              }) => {
                const callCellBg = isAtm
                  ? "bg-amber-50"
                  : isCallItm
                    ? "bg-blue-50/50"
                    : "";
                const putCellBg = isAtm
                  ? "bg-amber-50"
                  : isPutItm
                    ? "bg-rose-50/50"
                    : "";
                const strikeBg = isAtm ? "bg-amber-100" : "bg-slate-50";

                return (
                  <tr
                    key={strike}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td
                      className={`${callCellBg} py-1.5 pr-3 pl-4 text-right font-mono text-blue-700`}
                    >
                      {fmtIv(callIv)}
                    </td>
                    <td
                      className={`${callCellBg} px-3 py-1.5 text-right font-mono`}
                    >
                      {fmt(callLast)}
                    </td>
                    <td
                      className={`${callCellBg} px-3 py-1.5 text-right font-mono text-slate-400`}
                    >
                      {fmt(callAsk)}
                    </td>
                    <td
                      className={`${callCellBg} px-3 py-1.5 text-right font-mono text-slate-400`}
                    >
                      {fmt(callBid)}
                    </td>
                    <td
                      className={`${callCellBg} border-r border-slate-200 py-1.5 pr-4 pl-3 text-right text-xs text-slate-400`}
                    >
                      {callVol > 0 ? callVol : ""}
                    </td>

                    <td
                      className={`${strikeBg} px-4 py-1.5 text-center text-xs font-semibold ${isAtm ? "text-amber-700" : "text-slate-600"}`}
                    >
                      {strike.toLocaleString("es-AR")}
                      {isAtm && <span className="ml-1 text-amber-400">▲</span>}
                    </td>

                    <td
                      className={`${putCellBg} border-l border-slate-200 py-1.5 pr-3 pl-4 text-left text-xs text-slate-400`}
                    >
                      {putVol > 0 ? putVol : ""}
                    </td>
                    <td
                      className={`${putCellBg} px-3 py-1.5 text-left font-mono text-slate-400`}
                    >
                      {fmt(putBid)}
                    </td>
                    <td
                      className={`${putCellBg} px-3 py-1.5 text-left font-mono text-slate-400`}
                    >
                      {fmt(putAsk)}
                    </td>
                    <td
                      className={`${putCellBg} px-3 py-1.5 text-left font-mono`}
                    >
                      {fmt(putLast)}
                    </td>
                    <td
                      className={`${putCellBg} py-1.5 pr-4 pl-3 text-left font-mono text-rose-700`}
                    >
                      {fmtIv(putIv)}
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        IV calculada con Black-Scholes sobre el último precio operado. Sin
        transacciones recientes muestra —. Azul = calls ITM · Rosa = puts ITM.
      </p>
    </div>
  );
}
