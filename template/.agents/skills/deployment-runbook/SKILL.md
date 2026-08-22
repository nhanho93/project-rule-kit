---
name: deployment-runbook
description: Use when preparing, reviewing, executing, or troubleshooting deploys, releases, rollbacks, CI/CD, or environment promotion.
---

# Deployment Runbook

Core logic: deploy only after verified, authorized, and observable changes.

Benefit: reduces production incidents and makes recovery possible.

Why/when apply: deploy, release, rollback, CI/CD, env promotion, build pipeline,
infra scripts.

How to apply:

1. Read `docs/agent-rules/delivery-profile.md` and confirm authorization and target environment.
2. If delivery mutates Git, load `git-change-management`.
3. If delivery uses SSH or VM operations, load `vm-operations-runbook`.
4. Run required verification gates and identify migrations, secret/env names, compatibility, observability, and rollback risks.
5. Keep each delivery wave to one coherent, independently reversible commit.
   When push triggers a build or deployment, execute the strict sequence:
   verify -> commit -> push -> poll pipeline -> verify deployed version and
   health. Do not begin, commit, or push the next wave until this gate passes.
6. If build, deploy, polling, health, or smoke verification fails, stop the
   sequence, preserve evidence, and recover or rollback the failed wave. Do not
   stack another feature commit on an unresolved release.
7. Monitor the release, verify the exact version, and smoke test affected paths.
8. Record commit/version, checks, outcome, rollback readiness, owner, and next action.

## Limitations and Stop Conditions

- Permission to prepare or review a release does not authorize push, deploy,
  migration apply, service restart, or rollback.
- Do not start the next delivery wave until the pushed version completes its
  pipeline and declared health/smoke checks pass.
- Stop on version mismatch, failed build/health, unknown rollback, or an
  unapproved production mutation; preserve evidence and assign next action.

## Example

For two independent UI fixes, verify and commit Wave 1, push it, poll the named
pipeline, confirm the deployed SHA, and smoke the affected route. Only after PASS
repeat the sequence for Wave 2. A failed Wave 1 build blocks Wave 2 instead of
being hidden by a larger follow-up commit.
