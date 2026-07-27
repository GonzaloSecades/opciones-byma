---
id: P00
title: Control plane and baseline
status: active
epic: https://github.com/GonzaloSecades/opciones-byma/issues/1
depends_on: none
exit_gate: Q0+P00
---

# P00 — Control plane and baseline

## Outcome

Establish reproducible repository evidence, migration ownership, review
separation, and enforceable control-plane artifacts before backend work begins.

## Entry criteria

- The existing application and repository are accessible.
- No migration implementation is required before this phase.

## Work items

| Issue | Outcome | State at brief restoration |
| --- | --- | --- |
| [#2](https://github.com/GonzaloSecades/opciones-byma/issues/2) | Land migration KB and repository agent skill | Closed; artifact gap remediated by #81 |
| [#3](https://github.com/GonzaloSecades/opciones-byma/issues/3) | Capture repository and environment baseline | Closed |
| [#4](https://github.com/GonzaloSecades/opciones-byma/issues/4) | Inventory product, API, data, and calculation contracts | Closed |
| [#5](https://github.com/GonzaloSecades/opciones-byma/issues/5) | Record sequential test and production-build baseline | Closed |
| [#6](https://github.com/GonzaloSecades/opciones-byma/issues/6) | Run migration control-plane validation in CI | Open; depends on #81 |
| [#7](https://github.com/GonzaloSecades/opciones-byma/issues/7) | Land reviewer instructions and PR agent separation | Closed |
| [#8](https://github.com/GonzaloSecades/opciones-byma/issues/8) | Enable automatic Copilot review | Closed |
| [#81](https://github.com/GonzaloSecades/opciones-byma/issues/81) | Restore missing migration control-plane artifacts and validator | Active remediation |

## Preservation responsibilities

- Treat the [parity inventory](../baselines/P00-003-parity-inventory.md) as the
  behavioral starting contract.
- Treat the [environment baseline](../baselines/P00-002-repository-environment.md)
  and [test/build baseline](../baselines/P00-004-test-build.md) as reproducible
  evidence, not promises that all behavior is covered.
- Keep all entries in the [decision register](../decisions/README.md) open until
  their owning tickets merge evidence.

## Exit evidence

- The P00 row in [quality gates](../QUALITY_GATES.md) is satisfied.
- `corepack pnpm migration:validate` and its validator tests pass.
- #6 enforces the committed control plane in CI.
- Every P00 implementation issue is closed and the epic checklist reflects
  actual state.
