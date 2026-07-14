import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { exec } from "child_process";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

// Next.js corre desde apps/web; el root del monorepo está dos niveles arriba
const MONOREPO_ROOT = path.join(process.cwd(), "..", "..");

export const maxDuration = 60; // segundos — para Vercel; sin efecto en local

export async function POST() {
  try {
    const { stdout, stderr } = await execAsync("pnpm snapshot", {
      cwd: MONOREPO_ROOT,
      timeout: 55_000,
    });

    const lines = (stdout + stderr)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // Extraer stats del último log para devolverlos estructurados
    const summary = lines.find((l) => l.includes("✓ guardado")) ?? lines.at(-1) ?? "";

    // Invalidar caché ISR de las páginas que muestran datos del snapshot
    revalidatePath("/cadena");
    revalidatePath("/monitor");
    revalidatePath("/simulador");

    return NextResponse.json({ ok: true, lines, summary });
  } catch (err: unknown) {
    const e = err as { message?: string; stdout?: string; stderr?: string };
    const lines = ((e.stdout ?? "") + (e.stderr ?? ""))
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    return NextResponse.json(
      { ok: false, error: e.message ?? "Error desconocido", lines },
      { status: 500 },
    );
  }
}
