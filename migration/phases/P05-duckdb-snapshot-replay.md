---
id: P05
title: DuckDB snapshot replay
status: planned
epic: https://github.com/GonzaloSecades/opciones-byma/issues/55
depends_on: P03+P04
exit_gate: Q0+Q2+Q3+P05
---

# P05 — DuckDB snapshot replay

## Outcome

Deliver bounded, deterministic, cutoff-safe educational backtests using
PostgreSQL history materialized into one in-memory DuckDB instance per job.

## Entry criteria

- P03 normalized-data contracts and P04 versioned strategy/model contracts are
  complete.
- Data cutoff, fill, cost, and model versions are queryable and immutable for a
  submitted job.

## Work items

| Issue | Outcome |
| --- | --- |
| [#56](https://github.com/GonzaloSecades/opciones-byma/issues/56) | Backtest job schema and lifecycle API |
| [#57](https://github.com/GonzaloSecades/opciones-byma/issues/57) | One bounded in-memory DuckDB instance per job |
| [#58](https://github.com/GonzaloSecades/opciones-byma/issues/58) | Cutoff-bounded PostgreSQL history materialization |
| [#59](https://github.com/GonzaloSecades/opciones-byma/issues/59) | Daily trials and deterministic contract selection |
| [#60](https://github.com/GonzaloSecades/opciones-byma/issues/60) | Conservative bid-ask fills and transaction costs |
| [#61](https://github.com/GonzaloSecades/opciones-byma/issues/61) | Holding-days and target-DTE exits |
| [#62](https://github.com/GonzaloSecades/opciones-byma/issues/62) | Performance, coverage, and confidence metrics |
| [#63](https://github.com/GonzaloSecades/opciones-byma/issues/63) | Progress, cancellation, retry, timeout, and limits |
| [#64](https://github.com/GonzaloSecades/opciones-byma/issues/64) | Educational submission and results interface |
| [#65](https://github.com/GonzaloSecades/opciones-byma/issues/65) | Concurrent read-only deterministic replay proof |

## Preservation responsibilities

- Keep the existing `/backtest` placeholder route functional until #64 owns its
  replacement.
- Prevent look-ahead by binding every run to an immutable cutoff.
- Report missing data, quality exclusions, fills, costs, and confidence instead
  of hiding them behind aggregate performance.

## Exit evidence

- The P05 row in [quality gates](../QUALITY_GATES.md) is satisfied.
- Repeated runs with the same versioned inputs produce identical results.
- Cancellation, timeout, concurrency, and resource-limit behavior have E2E
  evidence.
