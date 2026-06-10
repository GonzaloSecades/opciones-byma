# 📈 Opciones BYMA

Programa de aprendizaje paso a paso + simulador interactivo de opciones sobre acciones del mercado argentino (BYMA).

**👉 Abrí [`GUIA.html`](./GUIA.html) en el navegador para la guía de uso completa.**

```bash
pnpm install
pnpm dev     # wiki + app en http://localhost:3000
pnpm test    # tests del motor de cálculo
```

- `content/wiki/` — lecciones en markdown (compatibles con Obsidian)
- `packages/core` — Black-Scholes, griegas, payoffs, estrategias (TS puro, testeado)
- `packages/data` — schemas, parser de tickers BYMA, abstracción `DataProvider`
- `apps/web` — Next.js: `/aprender`, `/simulador`, `/backtest`
- `CLAUDE.md` — contexto para usar Claude Code como tutor/companion

> Material educativo. Nada de esto es recomendación de inversión.
