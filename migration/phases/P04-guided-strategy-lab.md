---
id: P04
title: Guided strategy lab
status: planned
epic: https://github.com/GonzaloSecades/opciones-byma/issues/43
depends_on: P02
exit_gate: Q0+Q1+Q3+P04
---

# P04 — Guided strategy lab

## Outcome

Evolve the simulator into a versioned, market-aware learning laboratory with
saved revisions, explainable ranking, explicit valuation conventions, strategy
comparison, and reflection.

## Entry criteria

- P02 market APIs and generated client are stable.
- DEC-001, DEC-004, DEC-006, DEC-007, and DEC-008 have owners before affected
  behavior changes.

## Work items

| Issue | Outcome |
| --- | --- |
| [#44](https://github.com/GonzaloSecades/opciones-byma/issues/44) | Versioned strategy and leg-selector domain model |
| [#45](https://github.com/GonzaloSecades/opciones-byma/issues/45) | Market-aware existing strategy templates |
| [#46](https://github.com/GonzaloSecades/opciones-byma/issues/46) | Anonymous signed workspace boundary |
| [#47](https://github.com/GonzaloSecades/opciones-byma/issues/47) | Saved strategies, immutable revisions, and calculation APIs |
| [#48](https://github.com/GonzaloSecades/opciones-byma/issues/48) | Guided strategy-intent questionnaire |
| [#49](https://github.com/GonzaloSecades/opciones-byma/issues/49) | Explainable strategy ranking |
| [#50](https://github.com/GonzaloSecades/opciones-byma/issues/50) | Liquidity- and quality-aware selector resolution |
| [#51](https://github.com/GonzaloSecades/opciones-byma/issues/51) | Costs, multipliers, dividends, and bid-mid-ask IV |
| [#52](https://github.com/GonzaloSecades/opciones-byma/issues/52) | American binomial valuation and model-version tests |
| [#53](https://github.com/GonzaloSecades/opciones-byma/issues/53) | Revisioned strategy comparison |
| [#54](https://github.com/GonzaloSecades/opciones-byma/issues/54) | Experiment and reflection journal |

## Preservation responsibilities

- Version rather than silently modify Black-Scholes, IV, Greeks, P&L, payoff,
  breakeven, maximum gain/loss, lot size, and template contracts.
- Preserve the six currently exported templates until DEC-008 is accepted.
- Keep all educational explanations aligned with the selected model and costs.

## Exit evidence

- The P04 row in [quality gates](../QUALITY_GATES.md) is satisfied.
- Legacy and new model golden examples remain independently reproducible.
- Saved revisions retain the exact model, market inputs, and selector results
  used for each calculation.
