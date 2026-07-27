# Opciones BYMA

Programa de aprendizaje + simulador de opciones sobre acciones del mercado argentino (BYMA). El usuario es un **principiante aprendiendo opciones desde cero**: además de asistente de código, actuá como **tutor de opciones** — explicá conceptos en español, con ejemplos del mercado argentino (GGAL como subyacente por defecto), y verificá los números con `packages/core` cuando haga falta.

## Fuente de verdad para agentes

- Leé y cumplí `AGENTS.md` antes de empezar: contiene la política compartida de
  issues, validación, revisión y merge.
- Para todo issue con label `migration`, usá
  `.agents/skills/opciones-migration-control-plane/SKILL.md` y empezá por
  `migration/INDEX.md`.
- Después de abrir o actualizar un PR, usá
  `.agents/skills/opciones-review-heartbeat/SKILL.md`.
- Los planes privados bajo `~/.claude/` no son fuente de verdad del
  repositorio. La ejecución, los quality gates, la paridad y las decisiones
  abiertas viven en `migration/`.

## Flujo Codex / Claude

- Exactamente un implementador: `agent:codex` o `agent:claude`.
- Si implementa Codex, agregá `review:claude`; si implementa Claude, agregá
  `review:codex`. Repetí ambos labels en el issue y el PR.
- La revisión obligatoria debe venir de un contexto nuevo del agente opuesto.
  Una revisión del mismo agente, aunque use un subagente nuevo, no reemplaza
  ese control.
- El implementador corrige y publica los cambios acotados. El revisor opuesto
  vuelve a inspeccionar el SHA actual. Registrá labels, SHA, validación y
  resolución de hallazgos en el PR.
- Usá merge commit normal y conservá la rama remota después del merge.

## Comandos

```bash
pnpm install        # instalar todo (monorepo pnpm)
pnpm dev            # levantar la app web (Next.js) — http://localhost:3000
pnpm test           # correr todos los tests (Vitest)
pnpm build          # build de todos los paquetes
```

## Estructura

- `content/wiki/` — lecciones en markdown (frontmatter: `titulo, modulo, orden, descripcion, fuentes`). Compatible con Obsidian. Renderizadas en `/aprender`.
- `packages/core` — matemática pura, CERO dependencias: Black-Scholes + griegas (`blackScholes.ts`), IV por bisección, payoffs multi-pata, breakevens, plantillas de estrategias (`strategies.ts`). Tests con valores dorados.
- `packages/data` — schemas zod (`schema.ts`), parser de tickers BYMA (`tickerParser.ts`), interfaz `DataProvider` (clave: toda la app habla con esta interfaz; fase A = archivos estáticos, fase C = broker en vivo).
- `apps/web` — Next.js App Router. `/aprender` (wiki), `/cadena` (browser de cadenas M2), `/simulador` (M1), `/backtest` (M3).
- `data/samples/` — snapshots de ejemplo commiteados. `data/snapshots/` — historia real acumulada (gitignored).
- `scripts/IOL_API.md` — referencia de la API REST de IOL (auth, endpoints, flujo de tokens). Leer antes de tocar el snapshot script.
- `.env.example` — variables de entorno necesarias (IOL credentials, Supabase, config).

## Dominio: glosario argentino

- **base** = strike / precio de ejercicio
- **lote** = contrato de 100 acciones; la prima cotiza POR ACCIÓN (1 lote a prima $205 = $20.500)
- **lanzar** = vender/escribir una opción; **lanzamiento cubierto** = covered call (LA estrategia del mercado local)
- **prima** = premium; **papel** = el subyacente
- Ticker: `GFGC4700JU` = prefijo subyacente (GFG→GGAL) + C/V (call/put, V de "venta") + base + mes (`FE,AB,JU,AG,OC,DI` — ciclo bimestral, vence el 3er viernes)
- El prefijo NO es el ticker de la acción: GFG→GGAL, YPF→YPFD, PAM→PAMP, ALU→ALUA, COM→COME (mapa completo en `tickerParser.ts`)
- Liquidez MUY concentrada: GGAL domina; calls cerca del dinero del vencimiento próximo. Los puts y bases lejanas operan poco.
- El contrato legado preservado usa Black-Scholes europeo, sin dividendos, con
  tasa anual decimal y tiempo en años. Ejercicio americano, dividendos y costos
  son decisiones objetivo todavía abiertas; no los introduzcas implícitamente.
  Consultá el inventario P00-003 y el registro de decisiones antes de cambiar
  una convención financiera.

## Convenciones

- Identificadores de código en inglés; UI, wiki y labels de dominio en español.
- `lots` positivo = comprado, negativo = lanzado. `shares` ídem para acciones.
- Matemática financiera SIEMPRE en `packages/core` con tests; la UI no calcula nada por su cuenta.
- Nuevos providers de datos implementan `DataProvider` (`packages/data/src/provider.ts`) — no acoplar la UI a una fuente.

## Roadmap

La fuente versionada es `migration/INDEX.md`: P00 establece el control plane;
P01 crea la plataforma; P02 realiza el cutover PostgreSQL/NestJS; P03 y P04
continúan datos normalizados y estrategia guiada; P05 agrega replay con DuckDB;
P06 reúne extensiones incrementales. No adelantes una fase ni cierres una
decisión fuera del issue que la posee.
