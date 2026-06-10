import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllLessons, getLesson, getPrevNext } from "@/lib/wiki";

export function generateStaticParams() {
  return getAllLessons().map((l) => ({ slug: l.slug }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const { prev, next } = getPrevNext(slug);

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-2 text-sm text-slate-500">{lesson.modulo}</div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{lesson.titulo}</h1>
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
      </div>

      {lesson.fuentes && lesson.fuentes.length > 0 && (
        <section className="mt-10 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Fuentes
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {lesson.fuentes.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      <nav className="mt-10 flex justify-between gap-4 border-t border-slate-200 pt-6 text-sm">
        {prev ? (
          <Link href={`/aprender/${prev.slug.join("/")}`} className="hover:underline">
            ← {prev.titulo}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/aprender/${next.slug.join("/")}`}
            className="font-medium hover:underline"
          >
            Siguiente: {next.titulo} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
