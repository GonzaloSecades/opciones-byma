---
title: Migration decision register
version: 1.0.0
status: active
---

# Migration decision register

This register records unresolved choices discovered by the
[parity inventory](../baselines/P00-003-parity-inventory.md). An `Open` entry is
a prohibition on silently choosing a convention in an implementation PR. Use
the [decision template](../templates/DECISION.md) when a ticket is ready to
resolve one.

| ID | Decision | Status | Required owner/evidence |
| --- | --- | --- | --- |
| DEC-001 | European/no-dividend compatibility versus American exercise, dividends, commissions, and quote-side IV | Open | #51 and #52; golden finance examples and model version |
| DEC-002 | Canonical contract identity for month codes, years, special series, duplicates, and one-/two-letter coexistence | Open | #35 and #36; provider fixtures and collision rules |
| DEC-003 | Missing, stale, failed, and malformed quote semantics plus provenance and discovery truncation | Open | #32, #38, and #41; reason-code contract |
| DEC-004 | Exact risk-summary semantics for finite chart ranges, tangent roots, invalid numeric inputs, and unbounded payoff | Open | #47, #51, and #52; deterministic payoff tests |
| DEC-005 | Legacy persistence source and importer scope given observed Supabase REST usage and SQLite-oriented tickets | Open | #23, #25, #27, and #29; source audit before importer work |
| DEC-006 | Compatibility and retirement policy for exported `@opciones/core` and `@opciones/data` TypeScript contracts | Open | #18 and affected cutover tickets; versioned API/package plan |
| DEC-007 | Preservation owner for the lesson corpus, home page, navigation, and disclaimer | Open | Assign before an application-shell or content cutover |
| DEC-008 | Six exported strategy templates versus the nine-template premise in #45 | Open | #45; reconcile public array, product requirement, and fixtures |

## Decision lifecycle

1. Create or select an implementation issue that owns the decision.
2. Copy the decision template into this directory using the next stable ID.
3. Record observed behavior and evidence before listing options.
4. State compatibility and cutover consequences for each option.
5. Mark the register entry `Accepted` only when the decision document and its
   validation evidence are merged.
6. Preserve superseded decisions and link their replacement.
