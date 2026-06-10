import { z } from "zod";

/** Códigos de mes del ciclo bimestral de BYMA (vencen el 3er viernes). */
export const MONTH_CODES = ["FE", "AB", "JU", "AG", "OC", "DI"] as const;

export const OptionContractSchema = z.object({
  ticker: z.string(), // ej. "GFGC4700JU"
  underlying: z.string(), // ej. "GGAL"
  optionType: z.enum(["call", "put"]),
  strike: z.number().positive(),
  expiration: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO, 3er viernes
  monthCode: z.string(), // "JU", "AG", ... (con variantes posibles)
  lotSize: z.number().int().positive().default(100),
});
export type OptionContract = z.infer<typeof OptionContractSchema>;

export const OptionQuoteSchema = z.object({
  ticker: z.string(),
  ts: z.string(), // ISO timestamp del dato
  bid: z.number().nullable(),
  ask: z.number().nullable(),
  last: z.number().nullable(),
  volume: z.number().nonnegative().default(0),
  openInterest: z.number().nonnegative().nullable().default(null),
});
export type OptionQuote = z.infer<typeof OptionQuoteSchema>;

export const ChainSnapshotSchema = z.object({
  underlying: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  spot: z.number().positive(),
  /** Tasa libre de riesgo anualizada usada para valuación (decimal) */
  rate: z.number(),
  contracts: z.array(OptionContractSchema),
  quotes: z.array(OptionQuoteSchema),
});
export type ChainSnapshot = z.infer<typeof ChainSnapshotSchema>;
