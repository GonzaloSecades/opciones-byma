---
id: P03
title: Normalized ingestion and quality
status: planned
epic: https://github.com/GonzaloSecades/opciones-byma/issues/31
depends_on: P02
exit_gate: Q0+Q1+Q2+P03
---

# P03 — Normalized ingestion and quality

## Outcome

Make provider fetching, raw audit, canonical identity, normalization, quality,
retry policy, persistence, and orchestration deterministic and observable.

## Entry criteria

- P02 cutover is complete.
- DEC-002 and DEC-003 have explicit owning tickets and fixtures.

## Work items

| Issue | Outcome |
| --- | --- |
| [#32](https://github.com/GonzaloSecades/opciones-byma/issues/32) | Provider capability contract and raw response envelope |
| [#33](https://github.com/GonzaloSecades/opciones-byma/issues/33) | Checksummed raw provider payloads |
| [#34](https://github.com/GonzaloSecades/opciones-byma/issues/34) | Data912 fetch and deterministic normalization stages |
| [#35](https://github.com/GonzaloSecades/opciones-byma/issues/35) | IOL authentication, discovery, and quote normalization |
| [#36](https://github.com/GonzaloSecades/opciones-byma/issues/36) | Canonical instrument and provider-symbol reconciliation |
| [#37](https://github.com/GonzaloSecades/opciones-byma/issues/37) | Atomic and idempotent normalized snapshots |
| [#38](https://github.com/GonzaloSecades/opciones-byma/issues/38) | Stable quality rules and reason codes |
| [#39](https://github.com/GonzaloSecades/opciones-byma/issues/39) | Retries, timeouts, rate limits, and circuit behavior |
| [#40](https://github.com/GonzaloSecades/opciones-byma/issues/40) | Safe manual and scheduled orchestration |
| [#41](https://github.com/GonzaloSecades/opciones-byma/issues/41) | Source coverage and quality in product experiences |
| [#42](https://github.com/GonzaloSecades/opciones-byma/issues/42) | Credentialed BYMA adapter and redistribution boundary |

## Preservation responsibilities

- Preserve partial-quote, skipped-contract, source-order, ticker parsing, call
  guardrail, and run-accounting observations until their tickets replace them.
- Make every intentional change visible through stable quality reasons.
- Keep raw payload access and credentials behind explicit privilege boundaries.

## Exit evidence

- The P03 row in [quality gates](../QUALITY_GATES.md) is satisfied.
- Recorded provider fixtures replay to identical normalized results.
- Quality and orchestration behavior are observable without exposing secrets or
  raw internal errors to public clients.
