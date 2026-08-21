---
name: vm-operations-runbook
description: Use for SSH-based VM discovery or mutation, service/process operations, reverse proxies, logs, VM deploys, health checks, and rollback; excludes managed-platform deploys with no VM access.
---

# VM Operations Runbook

Operate a VM only after identifying the exact environment and proving the
planned mutation is authorized, observable, and recoverable.

Before any VM mutation, read:

1. `docs/agent-rules/delivery-profile.md`
2. `.agent-system/policies/delivery-safety.md`
3. [references/runbook.md](references/runbook.md)

The runtime may use systemd, PM2, containers, another orchestrator, or a custom
release process. Discover and follow the project-defined mechanism; never infer
one from another project. Deployment authorization does not automatically
authorize migration apply, service restart, firewall changes, or rollback.

At close, report the sanitized target identity, release/version, prechecks,
health and smoke results, relevant log window, rollback readiness/outcome, and
all unresolved owners/next actions.
If a phase-close manifest is used, include a sanitized `delivery` section with
the relevant `vm`, `deployment`, or `migration` operations, an environment/host
alias in `target`, explicit `authorized: true`, and action/result evidence.
