---
name: opciones-review-heartbeat
description: Monitor and address review feedback for an opciones-byma pull request with a fresh independent reviewer agent. Use after every PR is opened, when new commits land on a PR, while waiting for Copilot or human feedback, and until the PR is merged or closed.
---

# Opciones Review Heartbeat

## Start

1. Refuse to run inside the implementing agent. Spawn one new reviewer agent dedicated to exactly one PR.
2. Record the PR number, repository, head SHA, and reviewer-agent identifier.
3. Use the installed `github-review-heartbeat` skill for bounded monitoring.
4. Default to `READ_ONLY`. Use `FIX_AND_PUSH` only after explicit user authorization.

Never reuse a reviewer agent or its context for a different PR.

## Review

1. Check CI, GitHub Copilot feedback, human reviews, and unresolved review threads.
2. Verify every concern against the current head SHA before reporting it.
3. Require the `Quality gate` check to pass.
4. Confirm `pnpm test` and `pnpm build` evidence appears in the PR.
5. Treat Copilot and the heartbeat as complementary reviews; no counted GitHub approval is required.
6. Report actionable findings with file and line references. Do not manufacture work from stale or resolved feedback.
7. Continue until every valid comment is fixed or rebutted with evidence, every conversation is resolved, and CI passes.

## Refresh

When the PR head SHA changes, discard conclusions tied to the old SHA and re-check CI and review state. Confirm that Copilot was requested again for the new push. Never merge while actionable feedback remains.

## Stop

Stop monitoring and terminate the reviewer agent immediately when the PR is merged or closed. Do not retain the agent for the next PR. If monitoring cannot terminate agents directly, notify the orchestrating agent and require it to terminate the reviewer before completing the task.
