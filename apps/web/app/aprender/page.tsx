import Link from "next/link";
import { getModules } from "@/lib/wiki";

export const metadata = { title: "Aprender — Opciones BYMA" };

export default function AprenderIndex() {
  const modules = getModules();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">El programa</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Seguí los módulos en orden. Cada lección termina con ejercicios y
          fuentes para profundizar; muchas se conectan con el simulador.
        </p>
      </div>
      {modules.map((m) => (
        <section key={m.moduloDir}>
          <h2 className="mb-3 text-lg font-semibold">{m.modulo}</h2>
          <ul className="space-y-2">
            {m.lessons.map((l) => (
              <li key={l.slug.join("/")}>
                <Link
                  href={`/aprender/${l.slug.join("/")}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-400"
                >
                  <div className="font-medium">{l.titulo}</div>
                  {l.descripcion && (
                    <div className="mt-1 text-sm text-slate-500">{l.descripcion}</div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {modules.length === 0 && (
        <p className="text-slate-500">Todavía no hay lecciones en content/wiki.</p>
      )}
    </div>
  );
}
