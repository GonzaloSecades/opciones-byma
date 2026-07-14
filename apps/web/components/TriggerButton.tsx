"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type State = "idle" | "running" | "ok" | "error" | "aborted";

interface Props {
  /** "full" muestra texto + log expandible. "compact" muestra solo el ícono. */
  variant?: "full" | "compact";
}

export function TriggerButton({ variant = "full" }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [summary, setSummary] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);

  async function run() {
    setState("running");
    setSummary("");
    setLog([]);

    try {
      const res = await fetch("/api/snapshot", { method: "POST" });
      const data = (await res.json()) as {
        ok: boolean;
        lines: string[];
        summary?: string;
        error?: string;
      };

      setLog(data.lines ?? []);

      if (!data.ok) {
        setState("error");
        setSummary(data.error ?? "Error desconocido");
        return;
      }

      const isAborted = data.lines.some((l) => l.includes("ABORTADO"));
      setState(isAborted ? "aborted" : "ok");
      setSummary(data.summary ?? "");

      // router.refresh() re-fetches los server components sin navegar
      router.refresh();
    } catch (err) {
      setState("error");
      setSummary((err as Error).message);
    }
  }

  // ── Variante compacta: solo ícono ────────────────────────────────────────
  if (variant === "compact") {
    const icon =
      state === "running" ? "↻" :
      state === "ok"      ? "✓" :
      state === "error"   ? "✕" :
      state === "aborted" ? "⚠" : "↻";

    const title =
      state === "running" ? "Actualizando…" :
      state === "ok"      ? `Actualizado · ${summary.match(/spot=(\d+)/)?.[1] ? `spot $${Number(summary.match(/spot=(\d+)/)?.[1]).toLocaleString("es-AR")}` : "ok"}` :
      state === "error"   ? `Error: ${summary}` :
      state === "aborted" ? "Abortado — límite de calls mensual" :
                            "Actualizar cotizaciones";

    return (
      <button
        onClick={run}
        disabled={state === "running"}
        title={title}
        aria-label={title}
        className={`inline-flex h-6 w-6 items-center justify-center rounded transition-colors ${
          state === "running"
            ? "cursor-not-allowed text-slate-300"
            : state === "ok"
              ? "text-emerald-500 hover:text-emerald-600"
              : state === "error"
                ? "text-red-400 hover:text-red-500"
                : state === "aborted"
                  ? "text-yellow-500"
                  : "text-slate-300 hover:text-slate-500"
        }`}
      >
        <span className={state === "running" ? "inline-block animate-spin text-sm" : "text-sm"}>
          {icon}
        </span>
      </button>
    );
  }

  // ── Variante completa para /monitor ──────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={state === "running"}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            state === "running"
              ? "cursor-not-allowed bg-slate-200 text-slate-500"
              : "bg-slate-800 text-white hover:bg-slate-700"
          }`}
        >
          {state === "running" ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Capturando…
            </>
          ) : (
            "Actualizar ahora"
          )}
        </button>

        {state === "ok" && (
          <span className="text-sm font-medium text-emerald-700">
            ✓ {summary}
          </span>
        )}
        {state === "aborted" && (
          <span className="text-sm font-medium text-yellow-700">
            ⚠ Abortado — límite de calls
          </span>
        )}
        {state === "error" && (
          <span className="text-sm font-medium text-red-700">
            ✕ {summary}
          </span>
        )}
      </div>

      {log.length > 0 && (
        <div>
          <button
            onClick={() => setShowLog((v) => !v)}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            {showLog ? "▲ ocultar log" : "▼ ver log"}
          </button>
          {showLog && (
            <pre className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-300">
              {log.join("\n")}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
