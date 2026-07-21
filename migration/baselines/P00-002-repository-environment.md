# P00-002 repository and environment baseline

Captured on 2026-07-21 before platform migration work. Commands are PowerShell-compatible and use repository-relative paths so they can be rerun from `C:\dev\opciones-byma` or any other clone location.

## Git state

```powershell
git rev-parse HEAD
git status --short --branch
git remote -v
```

Recorded result:

```text
5e35a7c8e1bbbd220cec02d1dcf5ce7760876ffc
## codex/p00-002-environment-baseline
origin  git@github.com:GonzaloSecades/opciones-byma.git (fetch)
origin  git@github.com:GonzaloSecades/opciones-byma.git (push)
```

The worktree was clean at capture time. Any later `git status --short` entry is migration work or a user-owned change created after this checkpoint and must be classified before staging. Never use a broad staging command when unrelated entries exist.

## Toolchain

```powershell
git --version
node --version
corepack --version
corepack pnpm --version
```

Recorded result:

```text
git version 2.55.0.windows.2
v24.14.0
0.34.6
9.15.0
```

The repository contract is Node.js `>=20`, CI runs Node.js 22, and `packageManager` pins pnpm 9.15.0. Use `corepack pnpm` when a machine-global pnpm differs from the repository pin.

## Workspace package graph

```powershell
corepack pnpm -r list --depth -1 --json
```

| Workspace | Relative runtime path | Direct workspace dependencies | Role |
| --- | --- | --- | --- |
| `opciones-byma` | `.` | orchestrates all workspaces | scripts and monorepo commands |
| `@opciones/web` | `apps/web` | `@opciones/core`, `@opciones/data` | Next.js application and API route |
| `@opciones/core` | `packages/core` | none | pure financial calculations and strategies |
| `@opciones/data` | `packages/data` | none | schemas, ticker parsing, and `DataProvider` implementations |

Workspace discovery is defined by `pnpm-workspace.yaml` as `apps/*` and `packages/*`.

## Runtime entry paths

| Concern | Repository-relative path |
| --- | --- |
| Web application | `apps/web/app` |
| Snapshot API | `apps/web/app/api/snapshot/route.ts` |
| Supabase middleware | `apps/web/middleware.ts`, `apps/web/utils/supabase` |
| Financial domain | `packages/core/src/index.ts` |
| Market-data contract | `packages/data/src/provider.ts` |
| Static provider | `packages/data/src/providers/staticFiles.ts` |
| Snapshot worker | `scripts/snapshot.ts` |
| Sample market data | `data/samples` |
| Learning content | `content/wiki` |

Resolve the current checkout without hard-coding a user directory:

```powershell
$repoRoot = (git rev-parse --show-toplevel).Trim()
Resolve-Path $repoRoot
Resolve-Path (Join-Path $repoRoot 'apps/web')
Resolve-Path (Join-Path $repoRoot 'packages/core')
Resolve-Path (Join-Path $repoRoot 'packages/data')
```

## Environment variable names

List names without values:

```powershell
Get-Content .env.example |
  Where-Object { $_ -match '^[A-Za-z_][A-Za-z0-9_]*=' } |
  ForEach-Object { ($_ -split '=', 2)[0] }
```

Recorded names:

```text
IOL_USERNAME
IOL_PASSWORD
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SNAPSHOT_UNDERLYING
SNAPSHOT_RATE
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

`IOL_PASSWORD` and `SUPABASE_SERVICE_ROLE_KEY` are secrets. `IOL_USERNAME` is sensitive account data. Variables prefixed with `NEXT_PUBLIC_` and Supabase anonymous keys are client-visible by design and must never be treated as privileged credentials. This baseline records names only; do not print local values in diagnostics, CI logs, issues, or pull requests.

## Reproduction checklist

From a fresh clone at `C:\dev\opciones-byma`:

```powershell
Set-Location 'C:\dev\opciones-byma'
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm -r list --depth -1
corepack pnpm -r test
corepack pnpm -r build
```

The test and build results belong in the pull request's **Exact commands and results** section. Do not add `.env` values or generated runtime artifacts to the commit.
