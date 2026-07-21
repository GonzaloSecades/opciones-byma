# Copilot pull request review policy

Review the complete PR against its linked GitHub issue, acceptance criteria, repository architecture, and changed tests. Report only concrete, actionable defects introduced or exposed by the PR. Include the affected file and smallest useful line range, explain the failure mode, and suggest a practical correction. Do not leave generic praise, summaries, or purely stylistic comments unless style creates a correctness or maintainability risk.

Treat these as blocking findings:

- Incorrect financial results, unit conversions, sign conventions, expiry handling, or floating-point edge cases.
- Missing deterministic tests for changed financial or parsing behavior.
- Secrets, unsafe credential handling, authorization bypasses, injection risks, or server-only data exposed to clients.
- Breaking API, schema, persistence, or migration changes without compatibility and recovery handling.
- Race conditions, unbounded work, swallowed errors, stale data, or behavior that fails under retries.
- UI changes that break accessibility, responsive behavior, loading/error states, or Spanish user-facing terminology.
- Code that bypasses established boundaries: financial math belongs in `packages/core`; market-data access belongs behind `DataProvider`; UI code must not reimplement either.
- Claims not supported by the diff, tests, or reproducible validation evidence.

Apply BYMA domain conventions consistently:

- Option premiums are quoted per share; one lot represents 100 shares.
- Positive `lots` and `shares` are long; negative values are written or short.
- Use Argentine terminology in user-facing text: `base`, `prima`, `lote`, `papel`, and `lanzar`.
- Do not treat an option prefix as the underlying equity ticker; preserve the canonical mapping in `packages/data`.
- Treat options as American-style and preserve rate sensitivity in valuation logic.

Check every new push from the current head SHA. Re-evaluate earlier comments against the latest code and avoid repeating findings that are already fixed. All valid Copilot and heartbeat findings must be addressed or explicitly rebutted with evidence, and every conversation must be resolved before merge. CI passing is necessary but is not evidence of correctness by itself.

Use the matching files in `.github/instructions/` for technology-specific review criteria. Use relevant repository agent skills when specialized context is needed.
