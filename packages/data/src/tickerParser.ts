/**
 * Parser de tickers de opciones de BYMA.
 *
 * Formato general: <PREFIJO><C|V><STRIKE><VENC>
 *   GFGC4700JU  → call de GGAL, base 4700, vencimiento junio
 *   GFGV4700JU  → put  de GGAL, base 4700, vencimiento junio
 *
 * Particularidades:
 *  - El prefijo identifica al subyacente pero NO es el ticker de la acción
 *    (GFG→GGAL, YPF→YPFD, PAM→PAMP, ALU→ALUA, COM→COME, ...).
 *  - C = call, V = put ("venta").
 *  - El strike puede traer decimales implícitos o un punto (ej. COMC3.6JU).
 *  - El sufijo de vencimiento suele ser de dos letras (FE,AB,JU,AG,OC,DI),
 *    pero existen variantes de una letra y series especiales.
 */

export interface ParsedTicker {
  ticker: string;
  underlying: string;
  optionType: "call" | "put";
  strike: number;
  monthCode: string;
}

/** Prefijo de opción → ticker del subyacente. Extender a medida que aparezcan. */
export const PREFIX_TO_UNDERLYING: Record<string, string> = {
  GFG: "GGAL",
  YPF: "YPFD",
  PAM: "PAMP",
  ALU: "ALUA",
  COM: "COME",
  BMA: "BMA",
  TXA: "TXAR",
  TGS: "TGSU2",
  EDN: "EDN",
  BBA: "BBAR",
  SUP: "SUPV",
  CEP: "CEPU",
  TRA: "TRAN",
  MET: "METR",
  CRE: "CRES",
  BYM: "BYMA",
  VAL: "VALO",
  MIR: "MIRG",
  LOM: "LOMA",
};

const TICKER_RE = /^([A-Z]{3})([CV])(\d+(?:\.\d+)?)([A-Z]{1,2}[A-Z0-9]?)$/;

/** Normaliza sufijos de 1 letra a su equivalente de 2 letras. */
const SINGLE_TO_DOUBLE: Record<string, string> = {
  F: "FE", A: "AB", J: "JU", G: "AG", O: "OC", D: "DI",
};

export function parseTicker(raw: string): ParsedTicker | null {
  const ticker = raw.trim().toUpperCase();
  const m = TICKER_RE.exec(ticker);
  if (!m) return null;
  const [, prefix, cv, strikeStr, rawMonthCode] = m;
  const underlying = PREFIX_TO_UNDERLYING[prefix];
  if (!underlying) return null;

  let strike = Number(strikeStr);
  if (!Number.isFinite(strike) || strike <= 0) return null;

  // Sufijos de 1 letra (J, G, A, etc.): BYMA codifica el strike como entero×10.
  // Ej: GFGC74307J → strike real 7430.7. Los de 2 letras son enteros directos.
  const monthCode = SINGLE_TO_DOUBLE[rawMonthCode] ?? rawMonthCode;
  if (rawMonthCode.length === 1) {
    strike = strike / 10;
  }

  return {
    ticker,
    underlying,
    optionType: cv === "C" ? "call" : "put",
    strike,
    monthCode,
  };
}

/** Mes (1-12) que corresponde a cada código del ciclo bimestral. */
const MONTH_CODE_TO_MONTH: Record<string, number> = {
  FE: 2,
  AB: 4,
  JU: 6,
  AG: 8,
  OC: 10,
  DI: 12,
  // variantes de una letra vistas en pizarras
  F: 2,
  A: 4,
  J: 6,
  G: 8,
  O: 10,
  D: 12,
};

/** Tercer viernes del mes (vencimiento estándar de opciones en BYMA). */
export function thirdFriday(year: number, month: number): string {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const firstDow = first.getUTCDay(); // 0=domingo ... 5=viernes
  const offsetToFriday = (5 - firstDow + 7) % 7;
  const day = 1 + offsetToFriday + 14;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Fecha de vencimiento ISO a partir del código de mes y una fecha de referencia
 * (el snapshot): se asume el próximo vencimiento de ese mes ≥ referencia.
 */
export function expirationFromMonthCode(
  monthCode: string,
  referenceDate: string,
): string | null {
  const month = MONTH_CODE_TO_MONTH[monthCode];
  if (!month) return null;
  const refYear = Number(referenceDate.slice(0, 4));
  const candidate = thirdFriday(refYear, month);
  return candidate >= referenceDate ? candidate : thirdFriday(refYear + 1, month);
}
