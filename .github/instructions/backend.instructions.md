---
applyTo: "apps/api/**/*.ts,packages/**/*.ts,scripts/**/*.ts"
---

# Backend and domain review instructions

- Review TypeScript as strict server, domain, data-provider, ingestion, or automation code. Preserve package boundaries and avoid importing web concerns into shared packages.
- Keep `packages/core` pure and deterministic with zero runtime dependencies. Reject I/O, clocks, randomness, environment reads, framework code, and mutable global state in financial functions.
- Require golden-value and boundary tests for pricing, Greeks, implied volatility, payoffs, breakevens, lot multipliers, expiry behavior, invalid inputs, and numerical convergence whenever related behavior changes.
- Keep external market data behind the `DataProvider` contract. Validate and normalize provider payloads before domain use, preserve provenance and timestamps, and distinguish missing, stale, zero, and malformed values.
- Preserve BYMA ticker parsing and canonical prefix-to-underlying mappings. Reject silent fallback when a symbol, expiry, option side, or strike cannot be parsed reliably.
- For APIs, validate DTOs at the boundary, return stable documented errors, avoid leaking stack traces or secrets, and preserve backward compatibility unless the issue explicitly authorizes a breaking change.
- For database work, use typed migrations, explicit constraints, least-privilege roles, bounded transactions, indexed foreign keys, and safe rollback or forward-recovery steps. Flag destructive or irreversible changes.
- For jobs and ingestion, require idempotency, bounded retries with backoff, timeouts, cancellation, observability, and concurrency controls. Prevent duplicate snapshots and partial writes.
- Never log credentials, tokens, cookies, private portfolio data, or unredacted provider responses. Keep service-role credentials server-only.
- Require errors to be handled deliberately. Flag swallowed exceptions, ambiguous nulls, unchecked casts, unbounded collections, and floating-point equality checks in financial code.
