import Link from "next/link";
import { getModules } from "@/lib/wiki";

export default function HomePage() {
  const modules = getModules();
  const firstLesson = modules[0]?.lessons[0];

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Aprendé opciones del mercado argentino, paso a paso
        </h1>
        <p className="max-w-2xl text-slate-600">
          Un programa estructurado para pasar de cero a operar estrategias con
          opciones sobre acciones de BYMA: lecciones en español, un simulador
          interactivo de estrategias y, más adelante, backtesting con datos
          reales del mercado.
        </p>
        {firstLesson && (
          <Link
            href={`/aprender/${firstLesson.slug.join("/")}`}
            className="inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Empezar por la primera lección →
          </Link>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card
          title="📚 Aprender"
          href="/aprender"
          text="El programa completo: de qué es una opción hasta estrategias y gestión de riesgo, con foco en el mercado argentino."
        />
        <Card
          title="🧮 Simulador"
          href="/simulador"
          text="Armá posiciones multi-pata y mirá el diagrama de payoff, breakevens y griegas. (Próximamente)"
        />
        <Card
          title="⏪ Backtest"
          href="/backtest"
          text="Probá estrategias contra datos históricos del mercado y medí resultados. (Próximamente)"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Programa</h2>
        <ol className="space-y-2">
          {modules.map((m) => (
            <li key={m.moduloDir} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="font-medium">{m.modulo}</div>
              <div className="mt-1 text-sm text-slate-500">
                {m.lessons.map((l, i) => (
                  <span key={l.slug.join("/")}>
                    {i > 0 && " · "}
                    <Link
                      href={`/aprender/${l.slug.join("/")}`}
                      className="hover:text-slate-900 hover:underline"
                    >
                      {l.titulo}
                    </Link>
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Card({ title, href, text }: { title: string; href: string; text: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-400"
    >
      <div className="font-semibold">{title}</div>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </Link>
  );
}
