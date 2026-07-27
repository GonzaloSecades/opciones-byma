# Repository agent policy

## Issue ownership

- Work from one active GitHub issue at a time.
- Apply exactly one implementing-agent label: `agent:codex` or `agent:claude`.
- Apply exactly one opposite-agent reviewer label:
  - `agent:codex` requires `review:claude`.
  - `agent:claude` requires `review:codex`.
- Apply the same implementing-agent and reviewer-route labels to the issue and
  its pull request.
- Stage and commit only files owned by the active issue.
- Keep an issue open until its PR is merged into `master`.

## Pull requests

- Always open pull requests as ready for review. Never create draft pull requests.
- Push a branch and create its PR only when the user commands it.
- Do not merge unless the `Quality gate` check passes.
- Configure GitHub Copilot to review the initial PR and every subsequent push.
- Do not require a counted GitHub approval while the repository has one human developer.
- Address or rebut with evidence every valid Copilot and heartbeat finding, and resolve every conversation before merge.
- Merge through the GitHub CLI only when CI passes, reviews are complete, all comments are addressed, and the user has authorized the merge workflow.
- Use a regular merge commit, not squash or rebase merge, and retain the remote
  feature branch after merge.

## Reviewer lifecycle

- Invoke `$opciones-review-heartbeat` after opening each PR.
- Create a fresh, context-isolated reviewer from the opposite agent family for
  each PR. A same-family subagent does not satisfy the required cross-agent
  review.
- Do not reuse a reviewer from another PR or from implementation work.
- Run review monitoring in `READ_ONLY` mode unless the user explicitly authorizes fixes and pushes for that PR.
- Record a handoff comment with the implementing-agent label, reviewer-route
  label, inspected head SHA, validation evidence, and disposition of every
  finding.
- The implementer owns bounded fixes and publishes them; the opposite-agent
  reviewer re-checks the resulting current head.
- Re-check the current head after every push and continue until CI passes and no actionable review comments remain.
- If the required opposite-agent reviewer is unavailable, leave the PR
  unmerged and report the blocker instead of substituting a same-family review.
- Terminate the reviewer agent immediately when the PR is merged or closed. A later PR must start with a fresh agent and context.

## Validation

- Run `corepack pnpm -r test` and then `corepack pnpm -r build` before pushing.
- Record exact commands and results in the pull request.
