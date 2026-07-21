# P00-003 product, API, data, and calculation parity inventory

Captured on 2026-07-21 from `master` commit
`734b0b3656452de7c675b335ef2487e836e40080` before the PostgreSQL and NestJS
cutover. This is a behavioral baseline, not a target design. A later issue may
change a behavior only when it names the change, supplies compatibility or
cutover handling, and updates the relevant tests.

## How to read this inventory

- **Preserve** means keep the observed behavior and public shape during the
  migration.
- **Replace** means an existing migration issue owns a deliberate cutover.
- **Retire** means removal is allowed only after the replacement passes parity.
- **Gap** means the current behavior is ambiguous, unsafe, inconsistent, or has
  no downstream owner. A gap records uncertainty; it does not decide the fix.

Evidence was traced through the App Router pages and components, wiki loader,
Supabase access, package entry points, Zod schemas, static provider, ticker
parser, snapshot route and worker, SQL storage definitions, workflows, samples,
and all 28 current tests. Comments and roadmap claims are treated as intent only
when runtime code confirms them.

## Non-negotiable parity invariants

1. Premiums and stock prices are Argentine pesos per share. An option `lots`
   unit is multiplied by `LOT_SIZE = 100`; a stock leg is already expressed in
   individual `shares`.
2. Positive `lots`/`shares` are long and negative values are short or launched.
   Maximum loss is returned as the minimum signed P&L, not as a positive
   magnitude. `null` means unbounded in `maxGainLoss`.
3. Rates and volatility are annual decimals (`0.35 = 35%`); time is calendar
   years (`days / 365`). Theta is per calendar day, while vega and rho are per
   one percentage-point move.
4. Current valuation is European Black-Scholes with continuous discounting,
   no dividend yield, and a special intrinsic-value branch at expiry or
   non-positive volatility. BYMA options are described to users as American;
   changing the model belongs to #52 and must be versioned rather than silently
   changing current results.
5. The chain derives IV from `last` only. The simulator initializes a long leg
   from ask then last, a short leg from bid then last, and finally a model price.
   Those are distinct contracts.
6. Missing quote fields are `null`; volume defaults to `0`. Missing, stale,
   failed, and never-traded quotes are not currently represented as distinct
   states.
7. `@opciones/core` and `@opciones/data` export source TypeScript directly from
   their `src/index.ts` files. Their exported names are public migration inputs
   even though the packages are marked `private`.

## Product and route contracts

All listed browser routes are reachable without an application-level auth
check. Middleware constructs a Supabase SSR client and forwards any cookie
updates but never calls an auth method and never redirects. Database visibility
therefore depends on Supabase RLS. Both committed tables allow public reads.

| Surface | Observed contract | Failure, empty, and display behavior | Preservation or cutover owner |
| --- | --- | --- | --- |
| `/` | Server-rendered landing page. Reads the filesystem wiki index, links the first lesson, renders all modules, and links learning, simulator, and backtest cards. Root layout exposes navigation to learning, chain, simulator, backtest, and monitor plus an educational disclaimer. | If the wiki directory is absent, the first-lesson CTA and program rows disappear; no explicit error is shown. Simulator and backtest card copy still says “Próximamente” even though the simulator is implemented. | **Preserve** through P01-P03. **GAP-PRODUCT-01:** no issue explicitly owns landing/navigation parity or stale card copy; add it to #30 or create a follow-up before a web-shell change. |
| `/aprender` | Filesystem-backed index over `content/wiki`. Current content is 25 Markdown lessons in six lexically ordered module directories. Modules are grouped by directory; lessons sort by numeric frontmatter `orden`, with filesystem order as the stable tie input. | Missing wiki directory renders “Todavía no hay lecciones”. Missing frontmatter falls back to filename/module directory and order `0`. | **Preserve.** #13 creates a learning schema and #74 extends lessons, but neither explicitly owns migration of the existing 25 lessons. **GAP-PRODUCT-02:** assign content-source and route-parity ownership before moving learning content. |
| `/aprender/[...slug]` | `generateStaticParams` enumerates every Markdown/MDX lesson. The page renders GFM Markdown, frontmatter title/module/sources, and previous/next navigation across the globally sorted lesson list. Sources are displayed as plain text list items. | An unknown slug calls `notFound()`. `getLesson` accepts the route segments and joins them into filesystem candidates; there is no explicit segment allowlist. No per-lesson metadata title is generated. | **Preserve** content, ordering, links, Markdown/GFM rendering, and 404 behavior. Track slug validation and content-source decisions under **GAP-PRODUCT-02**; do not silently change routes during #13/#74. |
| `/cadena?monthCode=` | Server Component reads the latest Supabase `chain_snapshots` row for hard-coded `GGAL`, validates it with `ChainSnapshotSchema`, and renders one row per distinct strike with call/put bid, ask, last, volume, last-price IV, ITM shading, and nearest-strike ATM marking (a distance tie keeps the lower sorted strike). It declares `revalidate = 60`. It has no source, delay, or quality-warning fields to render. | Any query error and no row both render “Sin snapshots”. Schema errors are unhandled. Month codes are sorted by fixed bimonthly month number, deduplicated by month number, and default to the last ordinal code (“más lejano”), not the latest expiration date. Unknown query values fall back to that default. Duplicate type/strike contracts overwrite earlier tickers. An empty selected contract set reaches `reduce` without an initial value and throws. Numbers use `es-AR`; quotes use two decimals, spot zero, IV one percent decimal, and missing values `—`; zero volume is blank. Snapshot timestamp displays Buenos Aires time. | **Replace data access** in #21/#22/#25; expose quality/source in #41. Preserve table fields, month query fallback, IV source, DTE basis, colors, timestamp zone, and null/zero display until an issue explicitly changes them. **GAP-PRODUCT-03:** year-aware expiration selection, empty-contract behavior, and duplicate-series policy are unowned ambiguities. |
| `/simulador` | Reads the latest Supabase snapshot for hard-coded `GGAL`, validates it, and hydrates a client-side multi-leg simulator. Supports six templates, manual option/stock legs, contract/type/side/premium edits, expiration buttons, scenario sliders, expiry and Black-Scholes P&L curves, aggregate Greeks, breakevens, max gain/loss, and a capital affordability estimate. It declares `revalidate = 60`. | Query errors/no row render “Sin snapshots”; schema errors are unhandled. Default expiration is the first month ordinal, unlike `/cadena`. Empty contract lists still permit a synthetic ATM call priced by the model. Changing expiration resets scenario DTE but does not clear or re-resolve existing legs. | **Replace market loading** in #26 and selector behavior in #45/#50; calculation persistence/API belongs to #47; costs/model changes belong to #51/#52. Preserve current results until those versioned cutovers. **GAP-PRODUCT-04:** expiration-change leg semantics and empty-chain behavior need an explicit decision and tests. |
| `/monitor` | Reads the latest 100 `snapshot_runs`, newest first, and displays current UTC `YYYY-MM`, usage against 25,000, a hard-limit marker at 24,500, status counts, average calls for successful runs, recent run rows, and manual refresh. It declares `revalidate = 60`. | Supabase errors are ignored as an empty list. Usage sums only successful runs in the returned last 100. All displayed recent-run numeric metrics (spot, contracts, puntas, and calls) collapse zero to `—`; monthly summary cards and usage render numeric `0`. Error notes are available only as a title tooltip; aborted notes are not shown. Buenos Aires time is used for rows. UI constants can drift from worker environment configuration. | **Replace** in #27 and add provider quality/coverage in #41. Preserve run status/count fields and explicit empty state. **GAP-OPS-01:** pagination, complete-month accounting, query errors, notes visibility, and shared limit configuration must be decided by #27/#41. |
| `/backtest` | Static placeholder promising entry/exit/roll rules and P&L, drawdown, and win-rate output. No backtest calculation, API, storage, or input exists. | Always renders “En construcción”; body contains the current typo “corrla”. | **Preserve placeholder** until the bounded job/API and educational UI in #56-#65, especially #64, replace it. The placeholder is a user-visible capability and must not become a broken route mid-cutover. |
| `POST /api/snapshot` | No request body. Public route spawns `pnpm snapshot` from a monorepo root inferred as two parents above `process.cwd()`, with a 55-second timeout and route `maxDuration = 60`. On success it returns `{ ok: true, lines: string[], summary: string }`, where `summary` is the first line containing `✓ guardado` or the final output line, then revalidates chain/monitor/simulator. | A worker “ABORTADO” exits `0`, so the HTTP response remains `200`/`ok:true`; the client infers aborted state by scanning `lines`. Spawn/worker failure returns status `500` and `{ ok:false, error, lines }`. Raw stdout/stderr and the process error message are returned to the browser. There is no authentication, authorization, CSRF check, concurrency lock, idempotency key, or structured worker result. | **Replace** with protected queued submission in #28 and safe orchestration in #40. Preserve the three refresh targets and a distinct aborted outcome, but do not preserve the public process-spawn mechanism. |

### Shared web data-access behavior

- `/cadena` and `/simulador` use `.single()` after `.limit(1)` and collapse every
  Supabase error into the same empty state. `/monitor` ignores its error field.
- Both pages compute calendar DTE by rounding a JavaScript date difference
  divided by 86,400,000. Chain leaves negative DTE intact (and IV then returns
  `null`); simulator clamps DTE to zero. Neither uses exchange holidays or an
  intraday fraction.
- All three read Supabase directly. Neither `DataProvider` nor
  `StaticFileProvider` is used by the current web runtime, contrary to the
  architectural comment that “toda la app” uses `DataProvider`.
- The pages query all columns with `select("*")`. There are no generated
  database types; database rows are converted/cast locally.
- `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are non-null asserted at module load.
  The committed `.env.example` instead declares
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The drift is also recorded in P00-002.
- Page copy calls the 60-second behavior ISR, but the verified production build
  classifies `/cadena`, `/monitor`, and `/simulador` as dynamic routes rendered
  on demand. The server client reads cookies and queries Supabase without an
  explicit cache contract. Treat exact data cache/freshness semantics as
  **GAP-PRODUCT-05** and verify them in #25-#27; preserve the visible “latest”
  expectation, not the current ISR label.

## Data contracts

### Zod schemas

`@opciones/data` exports the schema values and their inferred types. Zod object
parsing applies the stated defaults and strips unrecognized object keys under
the current default object mode.

| Contract | Required fields and units | Defaults and validation | Missing validation that must not be invented during cutover |
| --- | --- | --- | --- |
| `OptionContract` | `ticker: string`, `underlying: string`, `optionType: "call" \| "put"`, `strike: positive number`, `expiration: YYYY-MM-DD string`, `monthCode: string`, `lotSize: positive integer` | `lotSize` defaults to `100` only when parsed through the schema. | Strings may be empty; date regex does not prove a real date; month code is not restricted to `MONTH_CODES`; no ticker/underlying/type/strike consistency check. |
| `OptionQuote` | `ticker`, `ts`, nullable numeric `bid`/`ask`/`last`, non-negative `volume`, nullable non-negative `openInterest` | `volume` defaults to `0`; `openInterest` defaults to `null`. Quote prices are nullable but not constrained positive. `ts` is any string. | No bid≤ask rule, timestamp validity/freshness, currency, source/provenance, or failure/staleness reason. |
| `ChainSnapshot` | `underlying`, `date: YYYY-MM-DD`, positive `spot`, numeric annual-decimal `rate`, contract array, quote array | Arrays may be empty; no defaults. | No unique tickers, quote-to-contract referential check, shared underlying, timestamp window, snapshot source, provider delay, warning list, or normalized expiration identity. |

`MONTH_CODES` is the readonly tuple `FE, AB, JU, AG, OC, DI`, but it is not
used by `OptionContractSchema`. The schema accepts one-letter variants as plain
strings, while `parseTicker` normalizes recognized one-letter suffixes to their
two-letter codes.

**Cutover:** #32 owns a provider capability/envelope contract, #38 quality
reason codes, #21/#22 repositories and API DTOs, and #18 generated frontend
types. Preserve the current fields and null/default meanings in an explicitly
versioned DTO. Add provenance and reason codes rather than overloading `null`.

### `DataProvider`

The exported interface is:

```ts
type Unsubscribe = () => void;

interface DataProvider {
  listUnderlyings(): Promise<string[]>;
  listSnapshotDates(underlying: string): Promise<string[]>;
  getChain(underlying: string, date?: string): Promise<ChainSnapshot>;
  subscribe?(
    underlying: string,
    callback: (snapshot: ChainSnapshot) => void,
  ): Unsubscribe;
}
```

Omitting `date` means “latest or live”. Ordering, error types, source identity,
pagination, cancellation, and subscription error/reconnect semantics are not
defined. No current page consumes this interface.

**Cutover:** preserve it as a compatibility interface until #21/#22/#32 define
the generated/repository replacement. **GAP-DATA-01:** decide whether it becomes
an adapter over the API, is versioned and expanded, or is retired; do not remove
it merely because current pages bypass it.

### `StaticFileProvider`

- `register(raw)` parses with `ChainSnapshotSchema`, stores by exact
  `underlying` and `date`, returns the parsed object, and silently overwrites a
  prior snapshot at the same pair.
- `listUnderlyings()` and `listSnapshotDates()` return ascending JavaScript
  lexical order. An unknown underlying returns `[]`.
- `getChain(underlying, date?)` selects the lexically greatest date when date is
  omitted. It throws `Error("Sin snapshots para X")` for no data and
  `Error("Sin snapshot de X para D")` for a missing date.
- Stored and returned snapshots are mutable object references. There is no
  persistence, realtime `subscribe`, provenance, or test coverage.

The two committed samples are GGAL `2026-06-05` (spot 5,000, rate 0.35, nine
contracts/quotes) and `2026-06-10` (spot 7,510, rate 0.199, 48
contracts/quotes). They are not loaded by the current web runtime.

**Cutover:** #24 owns versioned sample seeding. Preserve both fixtures and their
schema meaning until they pass through the normal replacement path. Provider
retirement follows the explicit decision in **GAP-DATA-01**.

### BYMA ticker and expiration parsing

`parseTicker(raw)` trims and uppercases, then accepts the structural form
`<three letters><C|V><positive digits or decimal><one-to-three character
suffix>`. It returns `null` for structural failure, an unknown prefix, or a
non-positive/non-finite strike.

- `C` maps to call; `V` maps to put.
- The public `PREFIX_TO_UNDERLYING` map contains:
  `GFG→GGAL`, `YPF→YPFD`, `PAM→PAMP`, `ALU→ALUA`, `COM→COME`, `BMA→BMA`,
  `TXA→TXAR`, `TGS→TGSU2`, `EDN→EDN`, `BBA→BBAR`, `SUP→SUPV`, `CEP→CEPU`,
  `TRA→TRAN`, `MET→METR`, `CRE→CRES`, `BYM→BYMA`, `VAL→VALO`, `MIR→MIRG`,
  and `LOM→LOMA`.
- A raw one-letter suffix `F/A/J/G/O/D` normalizes to
  `FE/AB/JU/AG/OC/DI` and divides the parsed strike by ten. The returned
  `ticker` remains the normalized uppercase raw ticker, so
  `GFGC74307J` has strike `7430.7`, month code `JU`, and ticker
  `GFGC74307J`.
- Other structurally accepted suffixes can be returned by `parseTicker`, but
  `expirationFromMonthCode` recognizes only the six standard one- and
  two-letter codes.
- `thirdFriday(year, month)` uses UTC and returns an ISO date. It relies on
  JavaScript date normalization and does not validate its numeric inputs.
- `expirationFromMonthCode(code, referenceDate)` uses the first four reference
  characters as the year and selects the standard third Friday in that year
  when its ISO string is greater than or equal to the reference string;
  otherwise it rolls to the next year. It does not validate the reference date
  or represent weekly/special/actual exchange expirations.

Tests preserve normalization, the prefix examples, June/August 2026 third
Fridays, same-year selection, next-year rollover, and `null` for an unknown
code. #35/#36 own IOL normalization and symbol reconciliation. Any broader
grammar or actual-expiration source is a versioned change with new fixtures;
the one-letter strike division cannot change silently.

## Snapshot collection, persistence, and monitoring contracts

### Worker configuration and source calls

`scripts/snapshot.ts` requires all four credentials at module evaluation:
`IOL_USERNAME`, `IOL_PASSWORD`, `SUPABASE_URL`, and
`SUPABASE_SERVICE_ROLE_KEY`. Runtime defaults are:

| Variable | Default and meaning |
| --- | --- |
| `SNAPSHOT_UNDERLYING` | `GGAL` |
| `SNAPSHOT_RATE` | `0.35`, annual decimal |
| `SNAPSHOT_NEAR_MONEY_PCT` | `0.25`, inclusive ±25% by absolute strike distance divided by spot |
| `SNAPSHOT_MAX_COTIZACIONES` | `50` individual quote requests |
| `CALL_HARD_LIMIT` | `24500` counted IOL calls in the UTC `YYYY-MM` month |
| internal `BATCH_SIZE` | `30` concurrent requests per sequential batch |

Numeric environment values use `parseFloat`/`parseInt` without range or finite
validation. The normal source sequence is password-grant login, underlying
quote, option discovery, then individual quotes. IOL market is always `bCBA`.
Spot chooses the first positive value among `ultimoPrecio`, `ultimo`, `last`,
and `precio`; otherwise collection fails with a truncated serialized provider
response in the error.

### Contract and quote normalization

1. Discovery accepts an array response or an object `.opciones` array. Empty
   discovery fails the run.
2. A contract ticker comes from `simbolo`, `symbol`, or `ticker`. Invalid,
   unknown-prefix, different-underlying, and unknown-expiration entries are
   skipped. Only an aggregate skipped count is logged; reason/ticker is lost.
3. Every accepted contract is assigned parser-derived fields, inferred standard
   third-Friday expiration, and `lotSize: 100`.
4. “Near money” retains discovery order, filters to the inclusive configured
   band, and then takes the first `MAX_COTIZACIONES`; it is not sorted by
   closeness, liquidity, type, or expiry.
5. An individual quote uses only `puntas[0]`; positive bid/ask/last values are
   retained and non-positive values become `null`. Volume and open interest use
   any finite numeric provider value, including negative values; absent or
   non-finite volume defaults to `0`, while absent/non-finite open interest is
   `null`. There is no sort or best-price validation.
6. Individual request failure is caught per ticker, logged, and represented by
   a quote whose prices are all `null` and volume is `0`; the rest of the
   snapshot still persists.
7. Non-selected contracts are looked up again by `.simbolo` only, then use that
   discovery row's `.cotizacion` last/volume/OI, force bid/ask to `null`, and
   receive the current snapshot timestamp even though the comment identifies
   this data as stale. A row originally accepted through the `symbol` or
   `ticker` fallback necessarily had a nullish `.simbolo`, so this lookup always
   loses that row's quote data and yields null last/OI plus zero volume unless a
   separate duplicate row has the ticker in `.simbolo`. The relookup uppercases
   but, unlike initial parsing, does not trim `.simbolo`, so surrounding
   whitespace causes the same loss. Staleness/provenance and these lookup losses
   are not encoded.
8. The assembled `ChainSnapshot` is TypeScript-annotated but is not parsed with
   `ChainSnapshotSchema` before REST persistence. In particular, negative
   volume/OI accepted by the worker violates `OptionQuoteSchema`, can persist in
   JSONB, and then makes `/cadena` and `/simulador` throw when they parse the
   stored snapshot.

### Call guardrail and accounting

- Before a non-dry run, `getMonthCalls` reads every `snapshot_runs.calls_total`
  for the current UTC month without filtering underlying or status. HTTP and
  network failures return `0`, so the safety check fails open.
- Projected usage is `monthCalls + 3 + MAX_COTIZACIONES` even when fewer
  contracts will qualify. A run aborts only when projected usage is strictly
  greater than the hard limit; equality is allowed. Aborts consume no IOL call,
  log status `aborted` with zero counts, and exit code `0`.
- A successful run counts three fixed calls plus individual requests that
  returned successfully. The increment occurs after `iolGet`, so failed
  individual HTTP requests are omitted even if the provider counted them.
- Any top-level failure logs status `error` with `calls_total: 0`, even when
  login/discovery/spot/quotes already consumed calls. Logging itself is
  best-effort and ignores non-2xx responses; only thrown network failures emit
  a warning.
- `--dry-run` skips the guardrail and persistence/logging but still logs in,
  fetches spot and discovery, and, when a near-money contract exists, fetches
  one sample individual quote. It therefore consumes provider calls while
  recording none.

These accounting/fail-open behaviors are observed gaps, not approved policy.
#35/#39 own authentication, retries, timeouts, rate limits, and orchestration;
#37 owns atomic/idempotent persistence; #38/#41 own quality and visibility.
They must add conservative accounting and structured outcomes while retaining
an auditable mapping from the legacy `calls_total` field.

### Storage shapes

`chain_snapshots` stores UUID `id`, `underlying`, `snapshot_date`, exact `ts`,
numeric `spot`/`rate`, JSONB `contracts`/`quotes`, and `created_at`. It has a
unique `(underlying, ts)` constraint and indexes for latest-by-underlying and
date. RLS grants `anon` and `authenticated` read access; service-role writes
bypass RLS. The table is added to Supabase Realtime, but no current web consumer
subscribes. Worker writes use POST with `resolution=ignore-duplicates`; they are
called “upsert” but never update an existing row.

`snapshot_runs` stores bigserial `id`, `ts`, textual `month`, `underlying`,
`calls_total`, `contracts_total`, `with_puntas`, nullable `spot`, textual
`status`, and notes. SQL does not constrain status values or non-negative
counts. Its public-read policy has no explicit role list. The worker sets
`with_puntas` to the count with non-null **bid**, while the monitor labels it
“Con bid/ask”; ask-only quotes are not counted.

The worker derives `date` and `month` from UTC ISO strings. The SQL comment calls
`snapshot_date` the Argentina-local date, so a manual run after 21:00 ARG can
violate that stated meaning. The scheduled workflow normally runs Monday-Friday
at `00,30 13-20 UTC` (10:00 through 17:30 ARG), although its comment says
10:00-17:00. The workflow has no concurrency key and uses major pnpm/action
versions plus `pnpm` 9 rather than the repository's exact package-manager pin.

#13/#21/#23/#25/#27/#29/#37 own parts of replacement persistence or cutover.
**GAP-DATA-02:** #23, #25, #27, and #29 assume a legacy SQLite/filesystem
runtime, but this baseline found current chain and monitor reads plus snapshot
writes in Supabase/PostgREST and no SQLite adapter, configuration, database, or
artifact workflow in the tracked tree. The removal checks in #27/#29 can pass
vacuously, while #23/#25 name the wrong source. Before those issues start,
reconcile all four scopes with the actual Supabase tables and the reported “one
snapshot/one run” source; do not invent SQLite data.

### Monitor output

- Worker progress logs configuration, cumulative/projected usage, auth, spot,
  parsed/skipped contract counts, near/far counts, batch progress, and a final
  saved summary. Partial quote failures are warnings.
- The API returns these logs verbatim to the caller. The compact button exposes
  state through icon/title; the full monitor button can expand the complete log.
- The client recognizes `ABORTADO` by Spanish log substring, not a response
  field. Only the triggering client instance disables duplicate submission;
  other tabs/users/processes remain concurrent.
- Monitor thresholds are 70/90/98 percent of 25,000. Remaining calls use
  `max(0, 25000-used)`. The displayed extra-cost claim is hard-coded copy, not a
  provider contract.

Preserve the meanings of legacy fields and logs for audit, but replace
substring parsing and implicit failures with structured statuses in #27/#28/#40.

## Financial calculation contracts

### Black-Scholes, normal functions, and units

For valid positive `spot`, `strike`, `timeToExpiry`, and `vol`:

```text
d1 = [ln(S/K) + (r + sigma²/2)t] / (sigma sqrt(t))
d2 = d1 - sigma sqrt(t)
discount = exp(-r t)
call = S N(d1) - K discount N(d2)
put = call - S + K discount
```

There is no dividend yield. `normPdf(x) = exp(-x²/2) / sqrt(2π)`.
`normCdf` is the Abramowitz-Stegun polynomial approximation using constants
`b1=.319381530`, `b2=-.356563782`, `b3=1.781477937`,
`b4=-1.821255978`, `b5=1.330274429`, `p=.2316419`, and
`c=.39894228040143267`, reflected around zero.

Greeks are:

```text
call delta = N(d1); put delta = N(d1)-1
gamma = n(d1) / [S sigma sqrt(t)]
call theta/year = -S n(d1) sigma/(2 sqrt(t)) - r K discount N(d2)
put theta/year  = -S n(d1) sigma/(2 sqrt(t)) + r K discount N(-d2)
theta returned = theta/year / 365
vega returned  = S n(d1) sqrt(t) / 100
call rho       = K t discount N(d2) / 100
put rho        = -K t discount N(-d2) / 100
```

Price and per-share Greeks are not rounded by core. When `t <= 0` **or**
`vol <= 0`, price is undiscounted intrinsic value; delta is `1` for a strictly
ITM call, `-1` for a strictly ITM put, otherwise `0`; all other Greeks are
zero. In particular, ATM expiry delta is zero and the non-positive-volatility
branch ignores positive remaining time and rate. Inputs are not runtime
validated; invalid spot/strike/non-finite values can propagate `NaN` or
infinities.

Golden tests preserve `N(0)≈0.5`, `N(±1.96)≈0.975/0.025`; Hull
`S=42, K=40, r=.10, sigma=.20, t=.5` gives call `≈4.76`, put
`≈0.81`, and put-call parity to six decimals. An expired `S=110, K=100`
call returns `10` and put `0`.

### Implied volatility

`impliedVol(input, marketPrice, options?)` returns an annual decimal or `null`.
Defaults are tolerance `1e-6`, maximum `100` iterations, and a fixed search
interval `[0.0001, 5]` (0.01%-500%). It rejects `t <= 0` and
`marketPrice <= 0`. No-arbitrage bounds use discounted strike:

```text
call lower = max(S - K exp(-rt), 0); upper = S
put  lower = max(K exp(-rt) - S, 0); upper = K exp(-rt)
```

Prices outside a bound by more than `tol` return `null`. Bisection returns when
the absolute price error is below tolerance; otherwise it returns the midpoint
after `maxIter`. It does not prove that the fixed upper volatility brackets the
price, validate custom tolerance/iterations, or distinguish no trade from a
solver failure. A test prices a GGAL-like call at volatility `0.55` and recovers
`0.55` to three decimals; a call premium below intrinsic returns `null`.

### Position payoff, P&L, and Greeks

- Expiry stock P&L is `(expirySpot - entryPrice) * shares`.
- Expiry option P&L is `(intrinsic - premium) * lots * 100`.
- Today stock P&L uses scenario spot. Option P&L is
  `(BlackScholesPrice - entryPremium) * lots * 100`.
- Today/Greeks volatility precedence is scenario `iv`, then leg `iv`, then
  `0.4`. Scenario DTE is clamped to at least zero then divided by 365. A leg's
  stored `daysToExpiry` is not read by either function.
- Aggregate option Greeks multiply per-share Greeks by `lots * 100`; stock
  contributes `shares` to delta and zero to all other Greeks.
- Calculations omit commissions, taxes, margin/collateral, dividends, exercise,
  assignment, early exercise, cash interest, and bid/mid/ask valuation modes.

Tests preserve a long `4700` call bought for `250`: P&L below strike is
`-25,000`, breakeven is `4,950`, maximum gain is `null`, and maximum loss is
`-25,000`. Covered-call and bull-spread examples are recorded below. There are
no current tests for `pnlToday`, aggregate Greeks, negative/zero/non-finite
inputs, short stock, multi-lot capital scaling, or the volatility precedence.

### Breakevens and maximum gain/loss

Both functions are numerical and caller-range dependent. Defaults are 2,000
grid steps.

- `breakevens` detects negative-to-nonnegative or positive-to-nonpositive
  crossings, then performs 50 bisection iterations and returns raw floating
  roots. It can miss a root at the left boundary, flat zero intervals,
  tangencies without a sign change, and every root outside `[min,max]`. It does
  not validate `min < max` or positive steps.
- `maxGainLoss` scans all 2,001 points. It compares one-grid-step payoff slopes
  at both boundaries against `1e-9`; a slope toward profit/loss makes the
  respective return `null`. Otherwise it returns the sampled signed maximum and
  minimum. “Maximum loss” can therefore be positive for an always-profitable
  sampled range, and unbounded classification depends on chosen boundaries.

The simulator calls both over `0.55 * entrySpot` through `1.45 * entrySpot`.
It displays breakevens rounded to the nearest $50 in cards; chart reference
positions round to whole pesos and labels to the nearest $100. Core output stays
unrounded. Max cards and P&L cards round to whole pesos. The chart samples 151
points and rounds each x value to a whole peso.

### Strategy templates

`round(x)` means `Math.round(x / 100) * 100`. Template premiums are per share;
`iv` and `daysToExpiry` pass through to option legs without validation.

| ID | Template legs at spot `S` |
| --- | --- |
| `compra-call` | long 1 call, strike `round(S)`, premium `0.05S` |
| `compra-put` | long 1 put, strike `round(S)`, premium `0.04S` |
| `lanzamiento-cubierto` | long 100 shares at `S`; short 1 call, strike `round(1.05S)`, premium `0.03S` |
| `bull-call-spread` | long 1 call at `round(S)`/`0.05S`; short 1 call at `round(1.10S)`/`0.02S` |
| `straddle-comprado` | long 1 call at `round(S)`/`0.05S`; long 1 put at the same strike/`0.04S` |
| `protective-put` | long 100 shares at `S`; long 1 put at `round(0.95S)`/`0.03S` |

`getStrategy` uses exact case-sensitive ID equality. At `S=5,000`, the covered
call has strike `5,300` (because 5,250 rounds upward), premium `150`, capped P&L
`45,000`, P&L `-35,000` at spot `4,500`, and breakeven `4,850` in tests. The
bull call spread costs `150` per share, has test-backed maximum loss `-15,000`,
and maximum gain `35,000`.

The `protective-put` display name adds “(collar simple)” but it has no short call
and is therefore not a collar by its legs. Record this as **GAP-FIN-01**; do not
change the ID/name/legs without explicit product ownership. #44/#45 own the
versioned strategy model and market-aware selectors. **GAP-FIN-03:** this
inventory and `STRATEGIES` contain exactly six templates, while #45 says “all
nine current templates.” Reconcile the issue count before implementation; the
cutover must neither fabricate three templates nor silently omit intended work.

### Simulator transformations beyond core

- Loading a template resolves each option to the nearest exact-type contract in
  the selected month. Ties keep the first source-order contract.
- Long premium precedence is ask → last → model; short precedence is bid → last
  → model. The model fallback is priced using the template strike, then the leg
  strike is replaced with the nearest real strike, so fallback premium and final
  strike can differ.
- Changing strike or call/put reselects the applicable market premium. Changing
  lot sign switches ask-side to bid-side precedence. Lot zero is rejected; the
  +/- controls jump across zero. Direct numeric inputs otherwise rely on browser
  controls and `Number(...)`, with no domain schema.
- Default scenario IV is `0.72`; default spot/rate are the snapshot values;
  default DTE is nonnegative snapshot-date-to-first-contract-expiration or 30
  when absent. Sliders permit IV 10%-200%, rate 5%-100%, DTE 0 through at least
  60, and spot roughly 50%-150%, all with their displayed steps.
- Chart calculation range is 55%-145% despite the code comment saying ±40%.
- Capital strips every non-digit (dots are treated as thousands separators), so
  signs and decimal meaning are discarded. Net debit includes only
  positive-share stock cost and signed option premiums; short-stock proceeds,
  margin, commissions, and collateral are ignored. Whole strategy units are
  `floor(capital/netDebit)` only when both are positive; zero/credit positions
  display “estrategia crediticia (margen)” without a capacity estimate.

#26 must preserve these transformations during data cutover. #45/#50/#51 may
replace them deliberately with selectors, quality checks, and explicit cost/
premium policies. **GAP-FIN-02:** fallback-price strike, month-change legs,
range-limited risk labels, and capital/margin meaning require test-backed
product decisions.

## Existing TypeScript exports

### Package public entry points

`@opciones/core` re-exports every name below from `src/index.ts`:

- types/interfaces: `OptionType`, `BsInput`, `Greeks`, `BsResult`, `OptionLeg`,
  `StockLeg`, `Leg`, `Position`, `ScenarioInput`, `StrategyTemplate`;
- values/functions: `normCdf`, `normPdf`, `blackScholes`, `impliedVol`,
  `LOT_SIZE`, `payoffAtExpiry`, `pnlToday`, `positionGreeks`, `breakevens`,
  `maxGainLoss`, `STRATEGIES`, and `getStrategy`.

`@opciones/data` re-exports every name below from `src/index.ts`:

- types/interfaces: `OptionContract`, `OptionQuote`, `ChainSnapshot`,
  `ParsedTicker`, `Unsubscribe`, and `DataProvider`;
- values/classes/functions: `MONTH_CODES`, `OptionContractSchema`,
  `OptionQuoteSchema`, `ChainSnapshotSchema`, `PREFIX_TO_UNDERLYING`,
  `parseTicker`, `thirdFriday`, `expirationFromMonthCode`, and
  `StaticFileProvider`.

No compiled declaration artifacts or `exports` map are declared; `main` and
`types` both point to source `src/index.ts`. #18/#22/#44/#47 must introduce
versioned generated/domain contracts without silently renaming fields, changing
optional/default semantics, or conflating schema input types with parsed output
types. **GAP-TYPES-01:** assign explicit compatibility/retirement ownership for
the two package entry points.

### Web module exports and implicit boundary shapes

The web app is not a package entry point, but these named TypeScript exports are
consumed internally or by Next.js and must remain traceable: `LessonMeta`,
`Lesson`, wiki query functions, `TriggerButton`, `SimuladorClient`,
`PayoffChart`, Supabase browser/server `createClient` functions,
`updateSession`, middleware/config, route metadata/revalidate constants,
`generateStaticParams`, API `POST`, and `maxDuration`.

Several important boundary shapes are only local or implicit:

- `snapshot_runs` uses the page-local `Run` type and unchecked cast;
- chain display uses page-local `Row`;
- snapshot API success/error bodies have no exported schema;
- simulator/chart props are private interfaces;
- Supabase tables have no generated `Database` type.

#18/#22/#27/#28 should replace these boundary casts/shapes with generated or
validated contracts while preserving response/state semantics through cutover.

## Preservation and cutover register

| Register ID | Capability/contract | Required action | Owner |
| --- | --- | --- | --- |
| PAR-01 | Home, layout, navigation, disclaimer | Preserve; add smoke coverage before any shell change. | **Unowned gap:** add to #30 or follow-up (`GAP-PRODUCT-01`). |
| PAR-02 | 25 learning lessons, index, slugs, order, Markdown/GFM, prev/next | Preserve current filesystem behavior until an explicit content migration proves count/slug/content parity. | #13/#74 are adjacent; ownership gap remains (`GAP-PRODUCT-02`). |
| PAR-03 | Latest GGAL chain fields, expiration selector, IV/display states | Replace access through typed repository/API/client without financial/UI drift. | #21, #22, #25; quality extension #41; legacy-source scope gap `GAP-DATA-02`. |
| PAR-04 | Simulator market loading and premium precedence | Replace Supabase loading; preserve calculations and observed quote/model fallback until versioned selectors. | #26, then #45/#50/#51; template-count gap `GAP-FIN-03`. |
| PAR-05 | Core finance functions, units, signs, edge behavior, exports | Preserve as legacy model/version; add compatibility tests before American/cost changes. | #44/#47/#51/#52; package retirement gap `GAP-TYPES-01`. |
| PAR-06 | Monitor run list/counts/status/usage | Replace with paginated run API and explicit error/empty states; reconcile legacy accounting. | #27/#41 and legacy-source scope gap `GAP-DATA-02`. |
| PAR-07 | Manual refresh and snapshot API outcomes | Replace public process spawn with protected queued submission and structured status; retain refresh visibility and aborted outcome. | #28/#40. |
| PAR-08 | IOL discovery, ticker normalization, partial quotes, source order | Split fetch/normalize, add raw audit and quality reasons; keep fixtures mapping every observed legacy outcome. | #32/#33/#35/#36/#38/#39. |
| PAR-09 | Snapshot/run persistence and current Supabase data | Import the actual legacy source once, then persist atomically/idempotently; do not assume SQLite. | #13/#21/#23/#37 and `GAP-DATA-02`. |
| PAR-10 | Zod/DataProvider/static provider/public data exports | Preserve fields/defaults/nulls until versioned DTO/provider decision; seed samples through replacement path. | #18/#21/#22/#24/#32 and `GAP-DATA-01`. |
| PAR-11 | Backtest placeholder route | Keep route functional until job API and educational interface replace it. | #56-#65, especially #64. |
| PAR-12 | Supabase public-read access during transition | Preserve required reads only until generated API cutover; removal/credential changes need a staged access plan. | #11/#22/#25-#29 and `GAP-DATA-02`. |

## Gaps that require explicit decisions

1. **Financial model:** European/no-dividend baseline versus American BYMA
   exercise, dividends, commissions, and quote-side IV (#51/#52).
2. **Contract identity:** month-code/third-Friday inference, special series,
   same-month different-year contracts, duplicate strike/type tickers, and
   one-letter/two-letter coexistence (#35/#36).
3. **Data quality:** missing versus stale versus failed versus malformed quote;
   discovery-order truncation; source/provider/timestamp provenance (#32/#38).
4. **Risk summaries:** finite chart range drives breakeven and unbounded labels;
   exact-zero/tangent roots and invalid numeric inputs lack tests.
5. **Operational safety:** fail-open call guardrail, undercounted failures/dry
   runs, unprotected concurrent refresh, raw log/error exposure (#28/#39/#40).
6. **Persistence source:** #23/#25/#27/#29 assume SQLite/filesystem behavior
   versus observed Supabase REST tables and no tracked SQLite integration
   (`GAP-DATA-02`).
7. **Public compatibility:** no owner currently states when source-level core/
   data exports can break or retire (`GAP-TYPES-01`).
8. **Learning and shell parity:** no current migration task expressly owns the
   existing lesson corpus, home, navigation, or disclaimer.
9. **Strategy count:** #45 claims nine current templates while the public array
   and this inventory contain six (`GAP-FIN-03`).

## Current test evidence and coverage gaps

`packages/core` contains 14 tests across Black-Scholes/IV and position/template
examples. `packages/data` contains 14 ticker/expiration tests. The web app,
Zod schemas, `DataProvider`, `StaticFileProvider`, snapshot worker/API,
Supabase queries, storage SQL, monitor, and simulator interactions have no
automated tests.

Before a behavior-changing issue cuts over, convert the relevant observed
examples and gaps above into deterministic unit/contract/E2E tests. Existing
tests are necessary compatibility evidence but do not validate all behavior in
this inventory.

## Validation for this inventory

Run from the repository root on this documentation-only branch, with the build
starting only after the tests exited successfully:

```powershell
corepack pnpm -r test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

corepack pnpm -r build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
```

Result: exit code `0` for both phases. Tests reported three files and 28 tests
passed: `@opciones/core` two files/14 tests and `@opciones/data` one file/14
tests. The production build used Next.js 15.5.19, compiled successfully,
completed lint/type checking, generated 35 static pages, and classified the
snapshot API plus chain, monitor, and simulator as dynamic routes. No warning
or failure was emitted.

Final whitespace validation:

```powershell
git diff --check
```

Result: exit code `0` with no output.
