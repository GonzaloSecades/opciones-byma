import type { Leg } from "./position";

/**
 * Plantillas de estrategias con nombres del mercado argentino.
 * Los parámetros son relativos al spot para poder instanciarlas
 * sobre cualquier subyacente/escenario.
 */
export interface StrategyTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  /** Crea las patas dadas referencias de mercado simples */
  build: (params: { spot: number; iv?: number; daysToExpiry?: number }) => Leg[];
}

const round = (x: number) => Math.round(x / 100) * 100;

export const STRATEGIES: StrategyTemplate[] = [
  {
    id: "compra-call",
    nombre: "Compra de call",
    descripcion:
      "Comprás el derecho a comprar al precio de la base. Pérdida limitada a la prima, ganancia ilimitada si el papel sube.",
    build: ({ spot, iv, daysToExpiry }) => [
      {
        kind: "option",
        type: "call",
        strike: round(spot),
        premium: spot * 0.05,
        lots: 1,
        iv,
        daysToExpiry,
      },
    ],
  },
  {
    id: "compra-put",
    nombre: "Compra de put",
    descripcion:
      "Comprás el derecho a vender al precio de la base. Es el seguro clásico contra la baja.",
    build: ({ spot, iv, daysToExpiry }) => [
      {
        kind: "option",
        type: "put",
        strike: round(spot),
        premium: spot * 0.04,
        lots: 1,
        iv,
        daysToExpiry,
      },
    ],
  },
  {
    id: "lanzamiento-cubierto",
    nombre: "Lanzamiento cubierto",
    descripcion:
      "Tenés las acciones y lanzás (vendés) un call contra ellas. La estrategia más operada del mercado argentino: cobrás la prima a cambio de resignar suba por encima de la base.",
    build: ({ spot, iv, daysToExpiry }) => [
      { kind: "stock", price: spot, shares: 100 },
      {
        kind: "option",
        type: "call",
        strike: round(spot * 1.05),
        premium: spot * 0.03,
        lots: -1,
        iv,
        daysToExpiry,
      },
    ],
  },
  {
    id: "bull-call-spread",
    nombre: "Bull spread con calls",
    descripcion:
      "Comprás un call y lanzás otro de base mayor. Apuesta alcista con costo y ganancia acotados.",
    build: ({ spot, iv, daysToExpiry }) => [
      {
        kind: "option",
        type: "call",
        strike: round(spot),
        premium: spot * 0.05,
        lots: 1,
        iv,
        daysToExpiry,
      },
      {
        kind: "option",
        type: "call",
        strike: round(spot * 1.1),
        premium: spot * 0.02,
        lots: -1,
        iv,
        daysToExpiry,
      },
    ],
  },
  {
    id: "straddle-comprado",
    nombre: "Straddle comprado",
    descripcion:
      "Comprás call y put de la misma base. Ganás si el papel se mueve fuerte para cualquier lado; perdés si se queda quieto.",
    build: ({ spot, iv, daysToExpiry }) => [
      {
        kind: "option",
        type: "call",
        strike: round(spot),
        premium: spot * 0.05,
        lots: 1,
        iv,
        daysToExpiry,
      },
      {
        kind: "option",
        type: "put",
        strike: round(spot),
        premium: spot * 0.04,
        lots: 1,
        iv,
        daysToExpiry,
      },
    ],
  },
  {
    id: "protective-put",
    nombre: "Put protector (collar simple)",
    descripcion:
      "Tenés las acciones y comprás un put como seguro: limitás la pérdida máxima pagando la prima.",
    build: ({ spot, iv, daysToExpiry }) => [
      { kind: "stock", price: spot, shares: 100 },
      {
        kind: "option",
        type: "put",
        strike: round(spot * 0.95),
        premium: spot * 0.03,
        lots: 1,
        iv,
        daysToExpiry,
      },
    ],
  },
];

export function getStrategy(id: string): StrategyTemplate | undefined {
  return STRATEGIES.find((s) => s.id === id);
}
