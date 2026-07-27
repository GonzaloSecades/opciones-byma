---
id: P01
title: Platform foundation
status: planned
epic: https://github.com/GonzaloSecades/opciones-byma/issues/9
depends_on: P00
exit_gate: Q0+P01
---

# P01 — Platform foundation

## Outcome

Create the PostgreSQL, NestJS API, worker, typed database, generated client, and
developer/CI lifecycle foundation without cutting user routes away from the
existing application.

## Entry criteria

- P00 exit evidence is complete.
- Open control-plane decisions affecting platform boundaries are assigned.

## Work items

| Issue | Outcome |
| --- | --- |
| [#10](https://github.com/GonzaloSecades/opciones-byma/issues/10) | Docker Compose PostgreSQL with health and persistent storage |
| [#11](https://github.com/GonzaloSecades/opciones-byma/issues/11) | Migration, application, and analytics database roles |
| [#12](https://github.com/GonzaloSecades/opciones-byma/issues/12) | Typed Drizzle database package and migration lifecycle |
| [#13](https://github.com/GonzaloSecades/opciones-byma/issues/13) | Initial market, learning, and analytics schemas |
| [#14](https://github.com/GonzaloSecades/opciones-byma/issues/14) | NestJS API application and module boundaries |
| [#15](https://github.com/GonzaloSecades/opciones-byma/issues/15) | Configuration validation, logging, validation pipe, and problem details |
| [#16](https://github.com/GonzaloSecades/opciones-byma/issues/16) | Liveness, readiness, and graceful shutdown |
| [#17](https://github.com/GonzaloSecades/opciones-byma/issues/17) | Separate NestJS worker with PostgreSQL-backed queue |
| [#18](https://github.com/GonzaloSecades/opciones-byma/issues/18) | OpenAPI document and typed frontend client |
| [#19](https://github.com/GonzaloSecades/opciones-byma/issues/19) | PostgreSQL integration CI and lifecycle commands |

## Preservation responsibilities

- Do not change current user-route data loading in this phase.
- Preserve existing public TypeScript contracts unless #18 explicitly versions
  their replacement.
- Keep credentials, roles, and worker privileges least-privileged and distinct.

## Exit evidence

- The P01 row in [quality gates](../QUALITY_GATES.md) is satisfied.
- A fresh environment can start, migrate, test, stop, and restart the platform.
- Generated API contracts and lifecycle commands are deterministic in CI.
