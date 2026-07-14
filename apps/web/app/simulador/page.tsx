import { createClient } from "@/utils/supabase/server";
import { ChainSnapshotSchema } from "@opciones/data";
import { SimuladorClient } from "@/components/simulador/SimuladorClient";

export const metadata = { title: "Simulador — Opciones BYMA" };
export const revalidate = 60;

const MONTH_ORDER: Record<string, number> = {
  FE: 2, F: 2, AB: 4, A: 4, JU: 6, J: 6,
  AG: 8, G: 8, OC: 10, O: 10, DI: 12, D: 12,
};

export default async function SimuladorPage() {
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

  // Deduplicar códigos de mes (preferir 2 letras, ordenar cronológicamente)
  const allCodes = [...new Set(snapshot.contracts.map((c) => c.monthCode))];
  const seenMonths = new Set<number>();
  const monthCodes = allCodes
    .sort((a, b) => {
      const diff = (MONTH_ORDER[a] ?? 99) - (MONTH_ORDER[b] ?? 99);
      return diff !== 0 ? diff : b.length - a.length;
    })
    .filter((code) => {
      const m = MONTH_ORDER[code] ?? 99;
      if (seenMonths.has(m)) return false;
      seenMonths.add(m);
      return true;
    });

  const snapshotTs = new Date(row.ts).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <SimuladorClient
      snapshot={snapshot}
      monthCodes={monthCodes}
      snapshotTs={snapshotTs}
    />
  );
}
