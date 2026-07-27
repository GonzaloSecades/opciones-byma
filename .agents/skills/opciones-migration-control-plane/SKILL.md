---
name: opciones-migration-control-plane
description: Plan or implement opciones-byma migration tickets using the repository manifest, phase briefs, quality gates, parity inventory, and open-decision register.
---

# Opciones migration control plane

Use this skill for every issue labeled `migration`.

## Orient

1. Read `AGENTS.md`.
2. Read `migration/INDEX.md` and `migration/manifest.json`.
3. Read the active phase brief and `migration/QUALITY_GATES.md`.
4. For behavior, data, financial, or public-type work, read
   `migration/baselines/P00-003-parity-inventory.md`.
5. Read every applicable open entry in `migration/decisions/README.md`.
6. Read the active GitHub issue and its dependencies.

## Implement

- Work from one issue and exactly one implementing-agent label.
- Preserve observed behavior until the issue explicitly owns replacement or
  cutover.
- Record ambiguity in the decision register instead of inventing a convention.
- Update the manifest and index when adding or moving a control-plane artifact.
- Update the phase brief when scope, dependencies, or exit evidence changes.
- Keep CI enforcement work separate from the validator and knowledge-base
  source unless the active issue explicitly owns both.

## Validate

Run these commands sequentially from the repository root:

```powershell
corepack pnpm migration:validate
corepack pnpm migration:validate:test
corepack pnpm -r test
corepack pnpm -r build
git diff --check
```

Record exact commands and outcomes in the pull request. After the PR opens, use
the repository review-heartbeat skill with a fresh read-only reviewer and
require the Quality gate to pass.
