import { ChainSnapshotSchema, type ChainSnapshot } from "../schema";
import type { DataProvider } from "../provider";

/**
 * Provider sobre snapshots JSON pre-cargados (en memoria).
 * En la app web los archivos de data/ se cargan vía fetch o import
 * y se registran acá; en Node se pueden leer del filesystem y registrar igual.
 */
export class StaticFileProvider implements DataProvider {
  private snapshots = new Map<string, Map<string, ChainSnapshot>>();

  register(raw: unknown): ChainSnapshot {
    const snapshot = ChainSnapshotSchema.parse(raw);
    const byDate =
      this.snapshots.get(snapshot.underlying) ?? new Map<string, ChainSnapshot>();
    byDate.set(snapshot.date, snapshot);
    this.snapshots.set(snapshot.underlying, byDate);
    return snapshot;
  }

  async listUnderlyings(): Promise<string[]> {
    return [...this.snapshots.keys()].sort();
  }

  async listSnapshotDates(underlying: string): Promise<string[]> {
    return [...(this.snapshots.get(underlying)?.keys() ?? [])].sort();
  }

  async getChain(underlying: string, date?: string): Promise<ChainSnapshot> {
    const byDate = this.snapshots.get(underlying);
    if (!byDate || byDate.size === 0) {
      throw new Error(`Sin snapshots para ${underlying}`);
    }
    const key = date ?? [...byDate.keys()].sort().at(-1)!;
    const snapshot = byDate.get(key);
    if (!snapshot) {
      throw new Error(`Sin snapshot de ${underlying} para ${key}`);
    }
    return snapshot;
  }
}
