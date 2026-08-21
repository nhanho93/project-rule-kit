# Task Classification

Classify every request before choosing context, planning, or execution. File
count alone never determines risk.

## Classes

| Class | Meaning | Next action |
|---|---|---|
| `question` | Read-only answer or inspection with no project mutation | Run preflight `--simple`; answer with evidence |
| `basic` | One domain, small and reversible mutation, no elevated-risk signal | Establish basic receipt; execute immediately; verify and close |
| `complex` | Multi-step/domain/file work, unclear requirements, shared contract, user workflow, or E2E need | Establish planning receipt; pass plan gate; execute with checkpoints |
| `critical` | Auth/RBAC, DB/data mutation, production/deploy, secrets/permissions, history rewrite, concurrency/jobs, or cross-system consistency | Establish planning receipt; pass approved critical plan gate; execute only within authorization boundaries |

## Signals

Basic requires both: `single_domain`, `small_reversible`.

Complex signals: `multi_file`, `multi_domain`, `unclear_requirements`,
`shared_contract`, `user_workflow`, `e2e_required`, `architecture_change`.

Critical signals: `auth_rbac`, `database_change`, `data_mutation`,
`production_mutation`, `deployment`, `git_history_rewrite`,
`secrets_permissions`, `cross_system`, `concurrency_jobs`.

If any critical signal applies, classification must be `critical`. If evidence
is insufficient to prove `basic`, choose `complex`. A one-file change with a
critical signal remains critical.

The agent must state its proposed class, signals, reason, and next action before
execution. Clear question/basic work may use `classification_source=policy`.
Ambiguous (`unclear_requirements`) or critical work requires
`classification_source=user_confirmed` plus a sanitized confirmation reference.
User choice may raise risk; it cannot downgrade a detected critical signal.

## Required Commands

Question/read-only:

```text
node scripts/agent-preflight.mjs --simple
```

Basic mutation:

```text
node scripts/agent-preflight.mjs --task-id <id> --classification basic --request-summary "<sanitized>" --signal single_domain --signal small_reversible
```

Complex or critical work:

```text
node scripts/agent-preflight.mjs --task-id <id> --classification <complex|critical> --request-summary "<sanitized>" --signal <signal> [...]
node scripts/agent-plan-gate.mjs --task-id <id> --plan <path>
```

For critical or unclear work, add:

```text
--classification-source user_confirmed --confirmation-ref "<sanitized confirmation reference>"
```

Do not mutate project files while a receipt is in `planning` state.
