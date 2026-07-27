# Opciones BYMA migration control center

This directory is the versioned source of truth for the staged backend
migration. GitHub issues track execution; these files define phase boundaries,
quality gates, preserved behavior, and unresolved decisions.

The machine-readable artifact list is
[`manifest.json`](manifest.json). Run the validator before publishing any
control-plane change:

```powershell
corepack pnpm migration:validate
corepack pnpm migration:validate:test
```

Windows PowerShell can invoke the same cross-platform validator directly:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/validate-migration-control-plane.ps1
```

## Execution order

P00 establishes the control plane. P01 builds the platform foundation and P02
cuts the current application over to PostgreSQL and the NestJS API. P03 and P04
may proceed after P02. P05 requires the normalized-data and strategy contracts
from P03 and P04. P06 is incremental and each task must declare its concrete
dependency.

| Phase | Brief | GitHub epic | State |
| --- | --- | --- | --- |
| P00 | [Control plane and baseline](phases/P00-control-plane-and-baseline.md) | [#1](https://github.com/GonzaloSecades/opciones-byma/issues/1) | Active |
| P01 | [Platform foundation](phases/P01-platform-foundation.md) | [#9](https://github.com/GonzaloSecades/opciones-byma/issues/9) | Planned |
| P02 | [PostgreSQL cutover](phases/P02-postgresql-cutover.md) | [#20](https://github.com/GonzaloSecades/opciones-byma/issues/20) | Planned |
| P03 | [Normalized ingestion and quality](phases/P03-normalized-ingestion-and-quality.md) | [#31](https://github.com/GonzaloSecades/opciones-byma/issues/31) | Planned |
| P04 | [Guided strategy lab](phases/P04-guided-strategy-lab.md) | [#43](https://github.com/GonzaloSecades/opciones-byma/issues/43) | Planned |
| P05 | [DuckDB snapshot replay](phases/P05-duckdb-snapshot-replay.md) | [#55](https://github.com/GonzaloSecades/opciones-byma/issues/55) | Planned |
| P06 | [Scale, research, and learning extensions](phases/P06-scale-research-and-learning-extensions.md) | [#66](https://github.com/GonzaloSecades/opciones-byma/issues/66) | Planned |

## Control documents

- [Quality gates](QUALITY_GATES.md) define the evidence required at every PR and
  phase boundary.
- [Decision register](decisions/README.md) records choices that remain open and
  prevents later tickets from silently selecting a financial, data, or public
  contract.
- [Repository and environment baseline](baselines/P00-002-repository-environment.md)
  pins the reproducible starting state.
- [Product, API, data, and calculation parity inventory](baselines/P00-003-parity-inventory.md)
  is the preservation contract for migration work.
- [Sequential test and build baseline](baselines/P00-004-test-build.md) defines
  how later failures and warnings are classified.

## Templates and agent workflow

- [Phase brief template](templates/PHASE_BRIEF.md)
- [Issue brief template](templates/ISSUE_BRIEF.md)
- [Decision template](templates/DECISION.md)
- [Migration control-plane skill](../.agents/skills/opciones-migration-control-plane/SKILL.md)

The validator implementation is split into a
[cross-platform Node entrypoint](../scripts/validate-migration-control-plane.mjs),
a [Windows PowerShell wrapper](../scripts/validate-migration-control-plane.ps1),
and [deterministic validator tests](../scripts/validate-migration-control-plane.test.mjs).

## Change rules

1. Work from one active implementation issue and exactly one implementing-agent
   label.
2. Read the active phase brief, quality gates, parity inventory, and applicable
   open decisions before changing behavior.
3. Preserve current behavior until a ticket explicitly owns its replacement or
   cutover.
4. Record new ambiguity in the decision register; do not decide it implicitly
   in code.
5. Update this control center, its manifest, and the affected phase brief in the
   same PR when an artifact or gate changes.
6. Do not advance or close a phase epic until every phase exit condition has
   evidence.
