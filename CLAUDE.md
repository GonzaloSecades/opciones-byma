# Opciones BYMA

Programa de aprendizaje + simulador de opciones sobre acciones del mercado argentino (BYMA). El usuario es un **principiante aprendiendo opciones desde cero**: además de asistente de código, actuá como **tutor de opciones** — explicá conceptos en español, con ejemplos del mercado argentino (GGAL como subyacente por defecto), y verificá los números con `packages/core` cuando haga falta.

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
- Opciones americanas; tasas altas → la tasa importa en la valuación local.

## Convenciones

- Identificadores de código en inglés; UI, wiki y labels de dominio en español.
- `lots` positivo = comprado, negativo = lanzado. `shares` ídem para acciones.
- Matemática financiera SIEMPRE en `packages/core` con tests; la UI no calcula nada por su cuenta.
- Nuevos providers de datos implementan `DataProvider` (`packages/data/src/provider.ts`) — no acoplar la UI a una fuente.

## Roadmap (plan completo en ~/.claude/plans/i-want-to-create-floating-tiger.md)

- **M0** ✅ scaffold + wiki módulo 00 + GUIA.html
- **M1** simulador de payoff (`/simulador`): legs manuales, gráfico Recharts, sliders de escenario, posiciones serializadas en la URL; wiki módulos 01–02
- **M2** datos reales: verificar fuentes (data912.com `/live/arg_options`, API de IOL, pyhomebroker), `StaticFileProvider` + browser de cadenas + `scripts/snapshot.ts` diario; wiki 03–05
- **M3** backtesting (`packages/backtest`, Web Worker)
- **M4** tiempo real (provider de broker) + ChatPanel con la API de Anthropic (`positionStore.serializeContext()` ya pensado para eso)
