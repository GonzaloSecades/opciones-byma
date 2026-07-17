# Repository agent policy

## Issue ownership

- Work from one active GitHub issue at a time.
- Apply exactly one implementing-agent label: `agent:codex` or `agent:claude`.
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

## Reviewer lifecycle

- Invoke `$opciones-review-heartbeat` after opening each PR.
- Create a new reviewer agent for each PR. Do not reuse an agent from another PR or implementation work.
- Run review monitoring in `READ_ONLY` mode unless the user explicitly authorizes fixes and pushes for that PR.
- Re-check the current head after every push and continue until CI passes and no actionable review comments remain.
- Terminate the reviewer agent immediately when the PR is merged or closed. A later PR must start with a fresh agent and context.

## Validation

- Run `pnpm test` and `pnpm build` before pushing.
- Record exact commands and results in the pull request.
