## Issue

Closes #

## Summary

-

## Validation

- [ ] `corepack pnpm -r test`
- [ ] `corepack pnpm -r build`
- [ ] CI `Quality gate` passes

### Exact commands and results

Paste the commands exactly as run and their relevant output or result. Include links for remote checks.

```text
$ corepack pnpm -r test
<result>

$ corepack pnpm -r build
<result>

Quality gate: <run URL and result>
```

## Review routing

- [ ] This PR is ready for review (never a draft).
- [ ] Exactly one implementing-agent label is applied to the issue and PR.
- [ ] Exactly one opposite-agent reviewer label is applied to the issue and PR:
      `agent:codex` + `review:claude`, or
      `agent:claude` + `review:codex`.
- [ ] The opposite-agent reviewer is fresh and context-isolated; a same-family
      subagent is not being counted as the required review.
- [ ] GitHub Copilot review is requested and reruns after every push.
- [ ] `$opciones-review-heartbeat` is monitoring the current head in read-only
      mode.
- [ ] Every valid review comment is addressed or rebutted with evidence.
- [ ] Every review conversation is resolved.
- [ ] The reviewer agent will be terminated when this PR is merged or closed.
- [ ] Merge method is a regular merge commit and the remote feature branch will
      be retained.

### Cross-agent handoff

```text
Implementer label:
Required reviewer label:
Inspected head SHA:
Validation evidence:
Findings and dispositions:
```
