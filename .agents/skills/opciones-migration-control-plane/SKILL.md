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
7. Confirm exactly one implementing-agent label and its opposite-agent review
   route: `agent:codex` + `review:claude`, or
   `agent:claude` + `review:codex`.

## Implement

- Work from one issue, exactly one implementing-agent label, and exactly one
  opposite-agent reviewer label. Keep both labels synchronized between the
  issue and pull request.
- Preserve observed behavior until the issue explicitly owns replacement or
  cutover.
- Record ambiguity in the decision register instead of inventing a convention.
- Update the manifest and index when adding or moving a control-plane artifact.
- Update the phase brief when scope, dependencies, or exit evidence changes.
- Keep CI enforcement work separate from the validator and knowledge-base
  source unless the active issue explicitly owns both.

## Handoff

- Open a ready pull request only after the user authorizes publishing.
- Hand the current head to a fresh, context-isolated reviewer from the opposite
  agent family. Same-family self-review does not satisfy this requirement.
- Record the implementing label, reviewer label, inspected head SHA, exact
  validation evidence, and every finding disposition on the pull request.
- The implementer owns bounded remediation commits. The opposite reviewer must
  re-check the resulting current head.
- If the required reviewer is unavailable, leave the pull request unmerged and
  report the blocker.
- After all gates pass and the user authorizes merge, use a regular merge commit
  and retain the remote feature branch.

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
the repository review-heartbeat skill with a fresh read-only opposite-agent
reviewer and require the Quality gate to pass.
