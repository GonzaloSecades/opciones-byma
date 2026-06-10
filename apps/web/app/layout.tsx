import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Opciones BYMA",
  description:
    "Programa de aprendizaje y simulador de opciones del mercado argentino",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              📈 Opciones BYMA
            </Link>
            <div className="flex gap-4 text-sm font-medium text-slate-600">
              <Link href="/aprender" className="hover:text-slate-900">
                Aprender
              </Link>
              <Link href="/simulador" className="hover:text-slate-900">
                Simulador
              </Link>
              <Link href="/backtest" className="hover:text-slate-900">
                Backtest
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 py-8 text-xs text-slate-400">
          Material educativo. Nada de esto es recomendación de inversión.
        </footer>
      </body>
    </html>
  );
}
