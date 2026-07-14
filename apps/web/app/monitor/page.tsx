import { createClient } from "@/utils/supabase/server";
import { TriggerButton } from "@/components/TriggerButton";

export const metadata = { title: "Monitor API — Opciones BYMA" };
export const revalidate = 60;

const MONTHLY_LIMIT = 25_000;
const HARD_LIMIT    = 24_500;

function fmtArgTime(ts: string): string {
  return new Date(ts).toLocaleString("es-AR", {
    timeZone:  "America/Argentina/Buenos_Aires",
    day:       "2-digit",
    month:     "2-digit",
    hour:      "2-digit",
    minute:    "2-digit",
  });
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

type Run = {
  id:              number;
  ts:              string;
  month:           string;
  calls_total:     number;
  contracts_total: number;
  with_puntas:     number;
  spot:            number | null;
  status:          "ok" | "aborted" | "error";
  notes:           string | null;
};

// ─── Barra de progreso ────────────────────────────────────────────────────────

function UsageBar({ used }: { used: number }) {
  const pct   = Math.min(100, (used / MONTHLY_LIMIT) * 100);
  const color =
    pct >= 98  ? "bg-red-600"
    : pct >= 90 ? "bg-orange-500"
    : pct >= 70 ? "bg-yellow-500"
    : "bg-emerald-500";

  const label =
    pct >= 98  ? "⛔ Cerca del límite"
    : pct >= 90 ? "⚠️  Atención"
    : pct >= 70 ? "🟡 Moderado"
    : "✓ Dentro del límite";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          {used.toLocaleString("es-AR")} / {MONTHLY_LIMIT.toLocaleString("es-AR")} calls
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            pct >= 98
              ? "bg-red-100 text-red-700"
              : pct >= 90
                ? "bg-orange-100 text-orange-700"
                : pct >= 70
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {label}
        </span>
      </div>

      {/* barra */}
      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* marcadores */}
      <div className="relative h-4 text-xs text-slate-400">
        <span className="absolute" style={{ left: `${(HARD_LIMIT / MONTHLY_LIMIT) * 100}%`, transform: "translateX(-50%)" }}>
          │ límite duro {HARD_LIMIT.toLocaleString("es-AR")}
        </span>
      </div>

      <p className="text-sm text-slate-600">
        {pct.toFixed(1)}% usado ·{" "}
        <strong className="text-slate-800">
          {Math.max(0, MONTHLY_LIMIT - used).toLocaleString("es-AR")} disponibles
        </strong>
        {" "}· costo extra si supera {MONTHLY_LIMIT.toLocaleString("es-AR")}: $500 + IVA
      </p>
    </div>
  );
}

// ─── Estadísticas del mes ─────────────────────────────────────────────────────

function MonthStats({ runs, month }: { runs: Run[]; month: string }) {
  const monthRuns = runs.filter((r) => r.month === month);
  const ok        = monthRuns.filter((r) => r.status === "ok").length;
  const aborted   = monthRuns.filter((r) => r.status === "aborted").length;
  const errors    = monthRuns.filter((r) => r.status === "error").length;
  const avgCalls  =
    ok > 0
      ? Math.round(
          monthRuns.filter((r) => r.status === "ok").reduce((s, r) => s + r.calls_total, 0) / ok,
        )
      : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: "Runs OK", value: ok, color: "text-emerald-700" },
        { label: "Abortados", value: aborted, color: "text-yellow-700" },
        { label: "Errores", value: errors, color: "text-red-700" },
        { label: "Calls/run (prom.)", value: avgCalls, color: "text-slate-700" },
      ].map(({ label, value, color }) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString("es-AR")}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Tabla de runs recientes ──────────────────────────────────────────────────

function RunsTable({ runs }: { runs: Run[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pl-4 pr-3 text-left">Hora (ARG)</th>
            <th className="px-3 py-2 text-right">Spot</th>
            <th className="px-3 py-2 text-right">Contratos</th>
            <th className="px-3 py-2 text-right">Con bid/ask</th>
            <th className="px-3 py-2 text-right">Calls IOL</th>
            <th className="py-2 pl-3 pr-4 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr
              key={run.id}
              className="border-b border-slate-100 last:border-0"
            >
              <td className="py-2 pl-4 pr-3 font-mono text-xs text-slate-500">
                {fmtArgTime(run.ts)}
              </td>
              <td className="px-3 py-2 text-right font-mono">
                {run.spot ? `$${run.spot.toLocaleString("es-AR", { maximumFractionDigits: 0 })}` : "—"}
              </td>
              <td className="px-3 py-2 text-right font-mono">
                {run.contracts_total || "—"}
              </td>
              <td className="px-3 py-2 text-right font-mono">
                {run.with_puntas > 0 ? (
                  <span className="text-emerald-700">{run.with_puntas}</span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2 text-right font-mono font-semibold">
                {run.calls_total || "—"}
              </td>
              <td className="py-2 pl-3 pr-4">
                {run.status === "ok" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    ✓ ok
                  </span>
                ) : run.status === "aborted" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
                    ⚠ abortado
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
                    title={run.notes ?? ""}
                  >
                    ✕ error
                  </span>
                )}
              </td>
            </tr>
          ))}
          {runs.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-400">
                Sin registros. Ejecutá <code>pnpm snapshot</code> para el primer run.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MonitorPage() {
  const supabase = await createClient();
  const month    = currentMonth();

  const { data: runsRaw } = await supabase
    .from("snapshot_runs")
    .select("*")
    .order("ts", { ascending: false })
    .limit(100);

  const runs = (runsRaw ?? []) as Run[];

  // Calls usadas en el mes actual
  const monthCalls = runs
    .filter((r) => r.month === month && r.status === "ok")
    .reduce((sum, r) => sum + r.calls_total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Monitor de API</h1>
        <p className="mt-1 text-sm text-slate-500">
          Uso de la API de IOL Inversiones · Límite bonificado: 25.000 calls/mes
        </p>
      </div>

      {/* Disparador manual */}
      <section className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">Captura manual</p>
          <p className="text-xs text-slate-400">
            Útil fuera de horario del job automático · consume ~53 calls IOL
          </p>
        </div>
        <TriggerButton />
      </section>

      {/* Uso del mes */}
      <section className="space-y-4 rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {month} — Mes actual
        </h2>
        <UsageBar used={monthCalls} />
      </section>

      {/* Stats del mes */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Resumen del mes
        </h2>
        <MonthStats runs={runs} month={month} />
      </section>

      {/* Runs recientes */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Últimos 100 runs
          </h2>
          <span className="text-xs text-slate-400">
            Se actualiza cada 60s (ISR)
          </span>
        </div>
        <RunsTable runs={runs} />
      </section>

      <p className="text-xs text-slate-400">
        Límite duro configurado: {HARD_LIMIT.toLocaleString("es-AR")} calls/mes · si se proyecta superar
        ese límite, el run es abortado automáticamente antes de consumir la API.
      </p>
    </div>
  );
}
