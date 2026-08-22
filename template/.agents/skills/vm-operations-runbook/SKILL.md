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

## When to Use

Use for SSH discovery or mutation, process/service management, VM-hosted deploys,
reverse proxies, logs, health checks, and rollback. Use the managed-platform or
deployment skill without this runbook when no VM access is involved.

## Limitations and Stop Conditions

- SSH access or deploy authorization does not imply permission to restart a
  service, apply a migration, change firewall/proxy config, or roll back.
- Never infer process manager, paths, host identity, or production status from
  another project; discover them from the delivery profile and read-only checks.
- Stop on host/version mismatch, unknown blast radius or recovery, missing health
  oracle, or an unapproved destructive/production action.

## Example

To diagnose a failing VM service, verify the sanitized host/environment and
release, inspect project-defined process status and a bounded log window, then
correlate the first error with health checks. If restart is separately authorized,
capture pre/post state and rollback readiness; otherwise report diagnosis and
the exact next action without mutating the service.
