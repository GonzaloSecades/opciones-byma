import { blackScholes, type Greeks, type OptionType } from "./blackScholes";

/** Tamaño de contrato en BYMA: la prima cotiza por acción, el lote es de 100. */
export const LOT_SIZE = 100;

export interface OptionLeg {
  kind: "option";
  type: OptionType;
  strike: number;
  /** Prima pagada (long) o cobrada (short), POR ACCIÓN */
  premium: number;
  /** Cantidad de lotes: positivo = comprado (long), negativo = lanzado (short) */
  lots: number;
  /** Volatilidad implícita para valuar "hoy" (decimal anual). Opcional. */
  iv?: number;
  /** Días al vencimiento al momento de armar la posición */
  daysToExpiry?: number;
}

export interface StockLeg {
  kind: "stock";
  /** Precio de compra/venta por acción */
  price: number;
  /** Cantidad de acciones: positivo = comprado, negativo = vendido */
  shares: number;
}

export type Leg = OptionLeg | StockLeg;

export interface Position {
  underlying: string;
  legs: Leg[];
}

/** P&L total de la posición A VENCIMIENTO para un precio dado del subyacente. */
export function payoffAtExpiry(position: Position, spotAtExpiry: number): number {
  let total = 0;
  for (const leg of position.legs) {
    if (leg.kind === "stock") {
      total += (spotAtExpiry - leg.price) * leg.shares;
    } else {
      const intrinsic =
        leg.type === "call"
          ? Math.max(spotAtExpiry - leg.strike, 0)
          : Math.max(leg.strike - spotAtExpiry, 0);
      total += (intrinsic - leg.premium) * leg.lots * LOT_SIZE;
    }
  }
  return total;
}

export interface ScenarioInput {
  spot: number;
  daysToExpiry: number;
  rate: number;
  /** Override global de IV; si falta, usa la IV de cada pata */
  iv?: number;
}

/** P&L de la posición HOY (mark-to-model con Black-Scholes) bajo un escenario. */
export function pnlToday(position: Position, scenario: ScenarioInput): number {
  let total = 0;
  for (const leg of position.legs) {
    if (leg.kind === "stock") {
      total += (scenario.spot - leg.price) * leg.shares;
    } else {
      const vol = scenario.iv ?? leg.iv ?? 0.4;
      const { price } = blackScholes({
        type: leg.type,
        spot: scenario.spot,
        strike: leg.strike,
        timeToExpiry: Math.max(scenario.daysToExpiry, 0) / 365,
        rate: scenario.rate,
        vol,
      });
      total += (price - leg.premium) * leg.lots * LOT_SIZE;
    }
  }
  return total;
}

/** Griegas agregadas de la posición bajo un escenario (escaladas por lote). */
export function positionGreeks(
  position: Position,
  scenario: ScenarioInput,
): Greeks {
  const sum: Greeks = { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  for (const leg of position.legs) {
    if (leg.kind === "stock") {
      sum.delta += leg.shares;
      continue;
    }
    const vol = scenario.iv ?? leg.iv ?? 0.4;
    const g = blackScholes({
      type: leg.type,
      spot: scenario.spot,
      strike: leg.strike,
      timeToExpiry: Math.max(scenario.daysToExpiry, 0) / 365,
      rate: scenario.rate,
      vol,
    });
    const scale = leg.lots * LOT_SIZE;
    sum.delta += g.delta * scale;
    sum.gamma += g.gamma * scale;
    sum.theta += g.theta * scale;
    sum.vega += g.vega * scale;
    sum.rho += g.rho * scale;
  }
  return sum;
}

/**
 * Puntos de equilibrio (breakevens) a vencimiento, por búsqueda de cambios
 * de signo sobre una grilla fina + bisección. Cubre posiciones multi-pata.
 */
export function breakevens(
  position: Position,
  { min, max, steps = 2000 }: { min: number; max: number; steps?: number },
): number[] {
  const result: number[] = [];
  const dx = (max - min) / steps;
  let prev = payoffAtExpiry(position, min);
  for (let i = 1; i <= steps; i++) {
    const x = min + i * dx;
    const cur = payoffAtExpiry(position, x);
    if ((prev < 0 && cur >= 0) || (prev > 0 && cur <= 0)) {
      // bisección entre x-dx y x
      let lo = x - dx;
      let hi = x;
      for (let j = 0; j < 50; j++) {
        const mid = (lo + hi) / 2;
        const v = payoffAtExpiry(position, mid);
        if ((payoffAtExpiry(position, lo) < 0) === (v < 0)) lo = mid;
        else hi = mid;
      }
      result.push((lo + hi) / 2);
    }
    prev = cur;
  }
  return result;
}

/** Ganancia y pérdida máximas a vencimiento dentro de un rango (null = ilimitada). */
export function maxGainLoss(
  position: Position,
  { min, max, steps = 2000 }: { min: number; max: number; steps?: number },
): { maxGain: number | null; maxLoss: number | null } {
  let maxGain = -Infinity;
  let maxLoss = Infinity;
  const dx = (max - min) / steps;
  for (let i = 0; i <= steps; i++) {
    const v = payoffAtExpiry(position, min + i * dx);
    if (v > maxGain) maxGain = v;
    if (v < maxLoss) maxLoss = v;
  }
  // Detectar payoff no acotado mirando la pendiente en los extremos
  const slopeRight =
    payoffAtExpiry(position, max) - payoffAtExpiry(position, max - dx);
  const slopeLeft =
    payoffAtExpiry(position, min + dx) - payoffAtExpiry(position, min);
  const unboundedGain = slopeRight > 1e-9 || slopeLeft < -1e-9;
  const unboundedLoss = slopeRight < -1e-9 || slopeLeft > 1e-9;
  return {
    maxGain: unboundedGain ? null : maxGain,
    maxLoss: unboundedLoss ? null : maxLoss,
  };
}
