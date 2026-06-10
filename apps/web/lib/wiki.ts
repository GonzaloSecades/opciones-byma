import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Pipeline del wiki: lee content/wiki/<modulo>/<leccion>.md,
 * ordena por frontmatter (modulo/orden) y arma navegación prev/next.
 * Los archivos son markdown plano, compatibles con Obsidian.
 */

const WIKI_DIR = path.join(process.cwd(), "..", "..", "content", "wiki");

export interface LessonMeta {
  slug: string[]; // ["00-fundamentos", "01-que-es-una-opcion"]
  titulo: string;
  modulo: string;
  moduloDir: string;
  orden: number;
  descripcion?: string;
  fuentes?: string[];
}

export interface Lesson extends LessonMeta {
  content: string;
}

export function getAllLessons(): LessonMeta[] {
  if (!fs.existsSync(WIKI_DIR)) return [];
  const lessons: LessonMeta[] = [];
  for (const moduleDir of fs.readdirSync(WIKI_DIR).sort()) {
    const modulePath = path.join(WIKI_DIR, moduleDir);
    if (!fs.statSync(modulePath).isDirectory()) continue;
    for (const file of fs.readdirSync(modulePath).sort()) {
      if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;
      const raw = fs.readFileSync(path.join(modulePath, file), "utf8");
      const { data } = matter(raw);
      lessons.push({
        slug: [moduleDir, file.replace(/\.mdx?$/, "")],
        titulo: data.titulo ?? file,
        modulo: data.modulo ?? moduleDir,
        moduloDir: moduleDir,
        orden: data.orden ?? 0,
        descripcion: data.descripcion,
        fuentes: data.fuentes,
      });
    }
  }
  return lessons.sort(
    (a, b) =>
      a.moduloDir.localeCompare(b.moduloDir) || a.orden - b.orden,
  );
}

export function getLesson(slug: string[]): Lesson | null {
  const candidates = [
    path.join(WIKI_DIR, ...slug) + ".md",
    path.join(WIKI_DIR, ...slug) + ".mdx",
  ];
  const filePath = candidates.find((p) => fs.existsSync(p));
  if (!filePath) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    titulo: data.titulo ?? slug.at(-1)!,
    modulo: data.modulo ?? slug[0],
    moduloDir: slug[0],
    orden: data.orden ?? 0,
    descripcion: data.descripcion,
    fuentes: data.fuentes,
    content,
  };
}

export function getPrevNext(slug: string[]): {
  prev: LessonMeta | null;
  next: LessonMeta | null;
} {
  const all = getAllLessons();
  const idx = all.findIndex((l) => l.slug.join("/") === slug.join("/"));
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
  };
}

/** Agrupa lecciones por módulo, preservando el orden. */
export function getModules(): { modulo: string; moduloDir: string; lessons: LessonMeta[] }[] {
  const byModule = new Map<string, { modulo: string; moduloDir: string; lessons: LessonMeta[] }>();
  for (const lesson of getAllLessons()) {
    const entry = byModule.get(lesson.moduloDir) ?? {
      modulo: lesson.modulo,
      moduloDir: lesson.moduloDir,
      lessons: [],
    };
    entry.lessons.push(lesson);
    byModule.set(lesson.moduloDir, entry);
  }
  return [...byModule.values()];
}
