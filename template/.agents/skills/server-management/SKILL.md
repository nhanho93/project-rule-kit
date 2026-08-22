---
name: server-management
description: Use when operating servers, services, processes, logs, health checks, reverse proxies, or runtime environments.
---

# Server Management

Diagnose and operate runtime services through an explicit target, authorization,
health and recovery contract. Observation does not imply restart permission.

## When to Use

Use for processes, services, logs, health checks, reverse proxies or runtime
environments. Read the project profile and delivery profile. For SSH/VM work,
load `vm-operations-runbook`; for release mutation, load deployment guidance.

Do not restart, reload, scale, rotate or mutate configuration from a request to
inspect status. Do not treat a running process as application health.

## Workflow

1. Resolve environment, host/service identity, owner and permitted operation.
2. Capture pre-state: version, process status, health, resource use, recent
   sanitized errors and upstream/downstream dependencies.
3. Diagnose root cause across application, process manager, proxy, network,
   storage and dependency layers before selecting an action.
4. Choose the smallest reversible operation and define rollback/abort triggers.
5. Execute only with action-specific authority; preserve bounded logs and exit
   status without secrets.
6. Verify process, application health, expected version, affected user path and
   error-rate stability after the action.

## Limitations and Stop Conditions

- Process-manager status cannot prove database, dependency or route health.
- Log absence may reflect rotation, routing or permission failure.
- Stop on target ambiguity, missing rollback, unknown active deploy/migration or
  concurrent operator activity.

## Example

```text
Symptom: service is online but endpoint returns 502.
Trace: proxy upstream -> listener -> application health -> dependency logs.
Action: fix only the proven failed layer; do not restart all services.
Proof: version, health, smoke path and stable error logs after observation window.
```

Completion requires pre/post evidence, root cause or bounded unresolved finding,
authorized action record and recovery readiness.
