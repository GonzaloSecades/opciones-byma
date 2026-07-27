---
id: P02
title: PostgreSQL cutover
status: planned
epic: https://github.com/GonzaloSecades/opciones-byma/issues/20
depends_on: P01
exit_gate: Q0+Q1+Q2+P02
---

# P02 — PostgreSQL cutover

## Outcome

Move current chain, simulator, monitor, refresh, and snapshot persistence to the
generated NestJS client and PostgreSQL with evidence-backed parity and a
controlled retirement of legacy runtime paths.

## Entry criteria

- P01 exit evidence is complete.
- DEC-005 has an owner and the actual legacy persistence source is audited.

## Work items

| Issue | Outcome |
| --- | --- |
| [#21](https://github.com/GonzaloSecades/opciones-byma/issues/21) | Typed latest-chain and snapshot repositories |
| [#22](https://github.com/GonzaloSecades/opciones-byma/issues/22) | Market underlyings, latest-chain, and snapshot APIs |
| [#23](https://github.com/GonzaloSecades/opciones-byma/issues/23) | One-time legacy-data importer |
| [#24](https://github.com/GonzaloSecades/opciones-byma/issues/24) | Versioned sample market data |
| [#25](https://github.com/GonzaloSecades/opciones-byma/issues/25) | Option-chain generated-client cutover |
| [#26](https://github.com/GonzaloSecades/opciones-byma/issues/26) | Simulator market-data cutover |
| [#27](https://github.com/GonzaloSecades/opciones-byma/issues/27) | Ingestion-monitor run API cutover |
| [#28](https://github.com/GonzaloSecades/opciones-byma/issues/28) | Protected queued ingestion submission |
| [#29](https://github.com/GonzaloSecades/opciones-byma/issues/29) | Retire legacy runtime persistence integration |
| [#30](https://github.com/GonzaloSecades/opciones-byma/issues/30) | Cutover parity E2E and operating guide |

## Preservation responsibilities

- Preserve the route, provider, schema, snapshot, monitor, and simulator
  contracts mapped by PAR-03, PAR-04, PAR-06, PAR-07, PAR-09, PAR-10, and PAR-12
  in the [parity inventory](../baselines/P00-003-parity-inventory.md).
- Do not assume SQLite where the observed runtime uses Supabase REST.
- Require import reconciliation and rollback evidence before retiring a source.

## Exit evidence

- The P02 row in [quality gates](../QUALITY_GATES.md) is satisfied.
- User-route parity tests pass against the generated client.
- No retired runtime persistence or process-spawn refresh path remains.
