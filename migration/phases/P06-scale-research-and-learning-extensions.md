---
id: P06
title: Scale, research, and learning extensions
status: planned
epic: https://github.com/GonzaloSecades/opciones-byma/issues/66
depends_on: P02-and-task-specific-later-phases
exit_gate: Q0+task-specific+P06
---

# P06 — Scale, research, and learning extensions

## Outcome

Add cold-history scale, richer analytics and backtests, lesson-linked
experiments, account claiming, and production operations without weakening the
earlier parity, data, financial, or replay contracts.

## Entry criteria

- P02 is complete.
- Each issue declares and satisfies its additional P03, P04, or P05 dependency.
- The issue applies the quality gates appropriate to its data, finance,
  security, or operations risk.

## Work items

| Issue | Outcome |
| --- | --- |
| [#67](https://github.com/GonzaloSecades/opciones-byma/issues/67) | Parquet cold-history lifecycle benchmark and specification |
| [#68](https://github.com/GonzaloSecades/opciones-byma/issues/68) | Checksummed immutable Parquet export |
| [#69](https://github.com/GonzaloSecades/opciones-byma/issues/69) | Unified recent and archived analytical history |
| [#70](https://github.com/GonzaloSecades/opciones-byma/issues/70) | IV surface, skew, and term-structure explorer |
| [#71](https://github.com/GonzaloSecades/opciones-byma/issues/71) | Provider reconciliation and liquidity-quality analytics |
| [#72](https://github.com/GonzaloSecades/opciones-byma/issues/72) | Stop, target, roll, and assignment-aware rules |
| [#73](https://github.com/GonzaloSecades/opciones-byma/issues/73) | Portfolio and walk-forward backtesting |
| [#74](https://github.com/GonzaloSecades/opciones-byma/issues/74) | Lesson-linked prediction and reflection |
| [#75](https://github.com/GonzaloSecades/opciones-byma/issues/75) | Accounts and anonymous-workspace claiming |
| [#76](https://github.com/GonzaloSecades/opciones-byma/issues/76) | Production observability, restore drills, and scale runbook |

## Preservation responsibilities

- Cold-history movement remains checksummed, reversible, and query-equivalent.
- Research features expose provenance, quality, and model versions.
- Account claiming cannot cross anonymous-workspace ownership boundaries.
- Production claims require exercised restore, observability, and capacity
  evidence.

## Exit evidence

- The P06 row in [quality gates](../QUALITY_GATES.md) is satisfied.
- Every task-specific dependency and applicable gate has recorded evidence.
- Backup restoration and operational limits are demonstrated before the epic
  closes.
