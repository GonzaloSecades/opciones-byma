/**
 * Black-Scholes europeo. Suficiente para aprender: las opciones sobre acciones
 * de BYMA son técnicamente americanas, pero para calls sin dividendos el valor
 * coincide, y para fines didácticos la aproximación es razonable.
 *
 * Unidades: S y K en pesos, t en AÑOS, r y sigma anualizadas (decimal).
 */

export type OptionType = "call" | "put";

/** CDF de la normal estándar (aproximación de Abramowitz & Stegun, error < 7.5e-8) */
export function normCdf(x: number): number {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228040143267; // 1/sqrt(2*pi)

  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const poly = t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
  const cdf = 1 - c * Math.exp((-absX * absX) / 2) * poly;
  return x >= 0 ? cdf : 1 - cdf;
}

/** PDF de la normal estándar */
export function normPdf(x: number): number {
  return Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI);
}

export interface BsInput {
  type: OptionType;
  spot: number; // S: precio del subyacente
  strike: number; // K: base / precio de ejercicio
  timeToExpiry: number; // t en años (días/365)
  rate: number; // r: tasa libre de riesgo anualizada
  vol: number; // sigma: volatilidad anualizada
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number; // por día calendario
  vega: number; // por punto porcentual de vol (1%)
  rho: number; // por punto porcentual de tasa (1%)
}

export interface BsResult extends Greeks {
  price: number;
}

function d1d2({ spot, strike, timeToExpiry: t, rate, vol }: Omit<BsInput, "type">) {
  const sqrtT = Math.sqrt(t);
  const d1 =
    (Math.log(spot / strike) + (rate + (vol * vol) / 2) * t) / (vol * sqrtT);
  const d2 = d1 - vol * sqrtT;
  return { d1, d2, sqrtT };
}

/** Precio y griegas de una opción europea por Black-Scholes. */
export function blackScholes(input: BsInput): BsResult {
  const { type, spot, strike, timeToExpiry: t, rate, vol } = input;

  // Vencida o casi: devolver valor intrínseco con griegas degeneradas
  if (t <= 0 || vol <= 0) {
    const intrinsic =
      type === "call" ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0);
    const inTheMoney =
      type === "call" ? spot > strike : spot < strike;
    return {
      price: intrinsic,
      delta: inTheMoney ? (type === "call" ? 1 : -1) : 0,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
    };
  }

  const { d1, d2, sqrtT } = d1d2(input);
  const discount = Math.exp(-rate * t);
  const nd1 = normCdf(d1);
  const nd2 = normCdf(d2);
  const pdf1 = normPdf(d1);

  const callPrice = spot * nd1 - strike * discount * nd2;
  const price =
    type === "call" ? callPrice : callPrice - spot + strike * discount; // paridad put-call

  const delta = type === "call" ? nd1 : nd1 - 1;
  const gamma = pdf1 / (spot * vol * sqrtT);
  const thetaAnnual =
    type === "call"
      ? (-spot * pdf1 * vol) / (2 * sqrtT) - rate * strike * discount * nd2
      : (-spot * pdf1 * vol) / (2 * sqrtT) +
        rate * strike * discount * normCdf(-d2);
  const vega = (spot * pdf1 * sqrtT) / 100; // por 1% de vol
  const rho =
    type === "call"
      ? (strike * t * discount * nd2) / 100
      : (-strike * t * discount * normCdf(-d2)) / 100;

  return { price, delta, gamma, theta: thetaAnnual / 365, vega, rho };
}

/**
 * Volatilidad implícita por bisección (robusta; Newton puede divergir
 * con primas lejos del dinero, comunes en el mercado argentino).
 * Devuelve null si la prima está fuera de los límites de no-arbitraje.
 */
export function impliedVol(
  input: Omit<BsInput, "vol">,
  marketPrice: number,
  { tol = 1e-6, maxIter = 100 }: { tol?: number; maxIter?: number } = {},
): number | null {
  const { type, spot, strike, timeToExpiry: t, rate } = input;
  if (t <= 0 || marketPrice <= 0) return null;

  const discount = Math.exp(-rate * t);
  const intrinsic =
    type === "call"
      ? Math.max(spot - strike * discount, 0)
      : Math.max(strike * discount - spot, 0);
  const upper = type === "call" ? spot : strike * discount;
  if (marketPrice < intrinsic - tol || marketPrice > upper + tol) return null;

  let lo = 1e-4;
  let hi = 5; // 500% anual: techo generoso para el mercado argentino
  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2;
    const price = blackScholes({ ...input, vol: mid }).price;
    if (Math.abs(price - marketPrice) < tol) return mid;
    if (price > marketPrice) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}
