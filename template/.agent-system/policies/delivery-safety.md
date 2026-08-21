# Delivery Safety

Core logic: repository and runtime mutations require an explicit target,
bounded scope, authorization, verification, and recoverability.

Always apply these invariants:

1. Read `docs/agent-rules/delivery-profile.md` before Git history, remote,
   deployment, VM, service, migration-apply, or rollback operations.
2. Begin with read-only discovery. Confirm repository root, branch, remote or
   environment, runtime identity, and existing project procedure.
3. Preserve unrelated user changes. Stage explicit paths and audit the staged
   diff; do not use broad staging as a shortcut.
4. Do not commit, push, merge, rewrite history, deploy, restart services,
   mutate production data, or roll back without authority for that action.
5. Never expose credentials or private connection details in commands, logs,
   manifests, screenshots, handovers, or chat.
6. Run project-defined gates before delivery and verify the resulting remote
   commit, release, health checks, logs, and affected user path afterward.
7. Stop on target ambiguity, failed prechecks, migration incompatibility,
   missing rollback readiness, or unexpected concurrent change.
8. Record sanitized evidence, unresolved owner, and next action at phase close.
