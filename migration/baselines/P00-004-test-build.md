# P00-004 sequential test and production-build baseline

Captured on 2026-07-21 from `master` commit
`0f7cbd8046c874b26d40d199fb15dd17633c5dcc`, before P01 platform changes.
The repository and toolchain context is recorded in
`migration/baselines/P00-002-repository-environment.md`.

## Execution contract

Run the two phases from the repository root in this order, waiting for each
process to exit before starting the next one:

```powershell
corepack pnpm -r test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

corepack pnpm -r build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
```

Using `corepack pnpm` honors the repository's `packageManager` pin
(`pnpm@9.15.0`) even when a different machine-global pnpm is first on `PATH`.
The commands were launched as separate foreground processes; the build did not
start until the test process exited successfully. This prevents test/build
artifact overlap and avoids the package-manager race previously observed when
different pnpm installations interpreted workspace configuration.

## Test result

Command:

```powershell
corepack pnpm -r test
```

Result: exit code `0` in approximately 8 seconds.

```text
Scope: 3 of 4 workspace projects
@opciones/core: 2 test files passed; 14 tests passed
@opciones/data: 1 test file passed; 14 tests passed
Total: 3 test files passed; 28 tests passed
```

Classification: clean baseline. No test failures, warnings, skipped tests, or
new worktree changes were produced. The web workspace has no test script, so
pnpm correctly ran tests only in the two workspaces that declare one.

## Production-build result

Command, started only after the test command completed:

```powershell
corepack pnpm -r build
```

Result: exit code `0` in approximately 43 seconds.

```text
Scope: 3 of 4 workspace projects
@opciones/web: Next.js 15.5.19
Compiled successfully
Linting and checking validity of types completed
35 static pages generated
Build traces collected
```

The route summary included the static learning pages, dynamic snapshot API,
chain, monitor, and simulator routes. Middleware compiled successfully.

Classification: clean baseline. No build failures, deprecation notices, lint
warnings, type errors, or new worktree changes were produced.

## Failure classification rule

This baseline contains no pre-existing test or build failure to waive. A later
failure is introduced after this checkpoint unless it can be reproduced at
commit `0f7cbd8046c874b26d40d199fb15dd17633c5dcc` with the pinned toolchain and
the same command. Record the failing command, exit code, relevant output, tested
commit, and reproduction result before classifying any future failure as
pre-existing.

Machine-specific elapsed time and Next.js chunk sizes are informational and
are not correctness gates. Exit status, test counts, compilation, lint/type
checking, and static-page generation are the reproducible baseline signals.
