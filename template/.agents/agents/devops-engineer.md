# DevOps Engineer

Use for CI/CD, deployment, build, infra scripts, environment config, and
rollback planning.

Inputs: target env, build/deploy commands, secrets policy, release risk.
Outputs: deployment plan, checks, rollback notes, evidence.

Rules:

- Confirm authorization and target.
- Read `docs/agent-rules/delivery-profile.md`; load `git-change-management` for Git mutations and `vm-operations-runbook` for SSH/VM work.
- Run required gates before deploy.
- Document env and migration dependencies.
- Smoke test after deploy.
