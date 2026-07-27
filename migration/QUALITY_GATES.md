---
title: Migration quality gates
version: 1.0.0
status: active
---

# Migration quality gates

These gates complement GitHub issue acceptance criteria. Passing a build alone
does not prove migration parity, financial correctness, data integrity, or safe
cutover.

## Gate Q0: every migration pull request

- One active issue and exactly one implementing-agent label.
- Issue-owned files only; unrelated worktree changes remain untouched.
- Exact validation commands and outcomes recorded in the PR.
- `corepack pnpm -r test`, followed by `corepack pnpm -r build`, succeeds.
- `git diff --check` succeeds.
- The required `Quality gate` check succeeds.
- Copilot review is requested; quota exhaustion is recorded when applicable.
- A fresh independent reviewer checks the current head.
- Every substantiated finding is fixed or rebutted with evidence, and every
  review conversation is resolved.
- User authorization is obtained before merge.

## Gate Q1: behavior or public-contract change

- The affected entry in the
  [parity inventory](baselines/P00-003-parity-inventory.md) names the
  preservation, replacement, or cutover owner.
- Existing units, signs, defaults, constants, rounding, expiration handling,
  invalid-input behavior, and error semantics have deterministic coverage.
- Any intentional incompatibility has a versioned contract and an explicit
  migration path.

## Gate Q2: persistence or market-data change

- Provenance, timestamps, provider identity, and quality reasons are preserved.
- Writes are atomic and idempotent where retries or concurrency are possible.
- Partial-provider failure and skipped-contract behavior are tested.
- Import, rollback, reconciliation, and audit evidence are defined before
  legacy data is retired.

## Gate Q3: financial-model change

- Model version, exercise convention, units, multiplier, rate, dividends,
  commissions, and quote side are explicit.
- Golden examples cover prices, implied volatility, Greeks, payoff, P&L,
  breakevens, and bounded or unbounded gain/loss.
- A finance-focused independent review is complete.

## Phase exit gates

| Phase | Exit evidence |
| --- | --- |
| P00 | Control-plane manifest and validator pass; baselines are committed; repository review and CI controls are active; no P00 task remains open. |
| P01 | PostgreSQL, roles, migrations, API, worker, generated client, health checks, and integration CI work from a fresh environment with documented lifecycle commands. |
| P02 | Chain, simulator, monitor, refresh, seed, and imported legacy data use the generated API/PostgreSQL path with parity E2E evidence; retired runtime persistence paths are absent. |
| P03 | Provider fetch and normalization are separated; raw and normalized data are auditable; identity, quality, retries, rate limits, and orchestration are deterministic and observable. |
| P04 | Versioned strategies, anonymous workspace, selectors, valuation models, costs, comparison, and journal flows preserve or intentionally migrate the documented financial contracts. |
| P05 | Backtest jobs are bounded, cancelable, deterministic, cutoff-safe, cost-aware, resource-limited, and proven under concurrent read-only replay. |
| P06 | Each extension has explicit dependencies and production evidence appropriate to its risk; backup restoration and scale limits are exercised before production claims. |

## Gate changes

Changing a gate requires a migration issue, an update to the affected phase
brief, and review of whether existing completed evidence still satisfies the
new wording. Gate changes cannot retroactively waive a known failure.
