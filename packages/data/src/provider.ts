import type { ChainSnapshot } from "./schema";

export type Unsubscribe = () => void;

/**
 * Abstracción de fuente de datos. Toda la app habla con esta interfaz:
 *  - Fase A: StaticFileProvider (snapshots históricos en data/)
 *  - Fase C: provider de broker en vivo (IOL, Primary, ...) sin tocar la UI.
 */
export interface DataProvider {
  listUnderlyings(): Promise<string[]>;
  listSnapshotDates(underlying: string): Promise<string[]>;
  /** Sin `date` devuelve el snapshot más reciente (o el dato en vivo). */
  getChain(underlying: string, date?: string): Promise<ChainSnapshot>;
  /** Solo providers en tiempo real. */
  subscribe?(
    underlying: string,
    callback: (snapshot: ChainSnapshot) => void,
  ): Unsubscribe;
}
