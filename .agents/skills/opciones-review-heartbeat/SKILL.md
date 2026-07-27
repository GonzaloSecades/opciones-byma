---
name: opciones-review-heartbeat
description: Monitor and address review feedback for an opciones-byma pull request with a fresh independent reviewer from the opposite agent family. Use after every PR is opened, when new commits land on a PR, while waiting for Copilot or human feedback, and until the PR is merged or closed.
---

# Opciones Review Heartbeat

## Start

1. Read the issue and PR labels. Require exactly one valid pair:
   `agent:codex` + `review:claude`, or
   `agent:claude` + `review:codex`.
2. Refuse to count a reviewer from the implementing agent family. Start one
   fresh, context-isolated reviewer from the required opposite family,
   dedicated to exactly one PR.
3. Record the PR number, repository, head SHA, implementing label,
   reviewer-route label, and reviewer identifier.
4. Use the installed `github-review-heartbeat` skill for bounded monitoring when it is available. Otherwise use the repository-safe fallback below; never block the immediate review on a missing global skill.
5. Default to `READ_ONLY`. The reviewer never fixes or pushes. The implementing
   agent may remediate only with the user's write authorization.

Never reuse a reviewer agent or its context for a different PR.
If the required opposite-agent reviewer cannot run, report the blocker and
leave the PR unmerged.

## Repository-safe fallback

When `github-review-heartbeat` is not installed:

1. Confirm `gh auth status`, resolve the PR, and capture its current head SHA.
2. Read PR metadata, checks, reviews, and top-level comments with `gh pr view`.
3. Read `reviewThreads` with `gh api graphql`, including thread IDs, `isResolved`, `isOutdated`, file and line anchors, and every comment. Follow GraphQL cursors until `hasNextPage` is false.
4. Apply the Review and Refresh rules below in `READ_ONLY` mode.
5. Use native Codex automation management for a finite recurring monitor when available. If scheduling is unavailable, report that recurring monitoring is unconfirmed and do not emulate it with loops, background processes, or edited automation files.

## Review

1. Check CI, GitHub Copilot feedback, human reviews, and unresolved review threads.
2. Verify every concern against the current head SHA before reporting it.
3. Require the `Quality gate` check to pass.
4. Confirm `corepack pnpm -r test` and `corepack pnpm -r build` evidence appears
   in the PR.
5. Treat Copilot and the heartbeat as complementary reviews; no counted GitHub approval is required.
6. Validate the opposite-agent review against the exact current head and
   publish each substantiated finding to the PR through the orchestrating
   implementer.
7. Report actionable findings with file and line references. Do not manufacture work from stale or resolved feedback.
8. Record a cross-agent handoff comment containing the implementing label,
   reviewer label, inspected head SHA, validation evidence, and disposition of
   every finding.
9. Continue until every valid comment is fixed or rebutted with evidence, every conversation is resolved, and CI passes.

## Refresh

When the PR head SHA changes, discard conclusions tied to the old SHA and
require the same opposite-agent reviewer to re-check the new current head.
Re-check CI and review state and confirm that Copilot was requested again for
the new push. Never merge while actionable feedback remains.

## Stop

Stop monitoring and terminate the reviewer agent immediately when the PR is merged or closed. Do not retain the agent for the next PR. If monitoring cannot terminate agents directly, notify the orchestrating agent and require it to terminate the reviewer before completing the task. Merge with a regular merge commit and retain the remote feature branch.
