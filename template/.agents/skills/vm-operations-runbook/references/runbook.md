# Portable VM Operations Runbook

## 1. Resolve Target And Authority

- Read the delivery profile. Resolve environment, host alias, working path,
  runtime owner, release mechanism, and approved action without exposing secret
  connection material.
- Confirm whether authority includes only discovery or also deploy, migration,
  restart, config change, rollback, or data mutation. Treat each separately.
- Use bounded network timeouts and non-interactive commands where practical.

## 2. Read-Only Discovery

- Confirm hostname/environment marker, OS, time/timezone, disk and memory,
  process manager/orchestrator, service state, reverse proxy, open release,
  repository/version, health endpoints, and recent sanitized logs.
- Inspect the existing deployment script or CI/CD path. Do not create a parallel
  deployment mechanism merely because direct SSH is available.
- Identify concurrent deploy locks, active jobs, maintenance windows, database
  dependencies, external services, and monitoring coverage.

## 3. Preflight And Rollback Readiness

- Verify source commit/artifact, build and test evidence, environment variables
  by name only, backups when needed, disk headroom, release permissions, and
  health-check commands.
- For migrations, load the migration-safety skill. Confirm target database,
  compatibility order, idempotency, backup/recovery, and separate production
  authorization before apply.
- Define rollback trigger, exact previous release/version, rollback command or
  mechanism, and post-rollback verification before mutation begins.

## 4. Execute The Existing Strategy

- Use the project-defined pipeline: CI/CD, immutable artifact, atomic/symlink
  swap, rolling/container release, or documented in-place process.
- Serialize deployment using the existing lock. Avoid unbounded commands and
  avoid printing environment values or credentials.
- Do not silently switch strategy, edit firewall/access control, install global
  packages, restart unrelated services, or delete releases/logs.

## 5. Verify And Observe

- Confirm deployed version, service/process stability, proxy/ingress health,
  internal and external health checks, affected user smoke path, error logs,
  resource pressure, scheduled jobs, and alerts.
- Observe for the project-defined stabilization window. A process marked online
  is not sufficient evidence of application health.
- If a rollback trigger fires, stop further promotion and execute only the
  approved rollback mechanism; then repeat health, smoke, log, and version checks.

## Close Evidence

- Sanitized environment/host alias, release ID or commit, timestamps, operator.
- Prechecks, deployment/migration actions, exit results, health/smoke/log evidence.
- Rollback readiness and whether invoked; remaining risk, owner, and next action.
