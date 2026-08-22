# AGENTS.md - Cross-Platform Agent Router

P0 instruction source for this repository.

## Platform Bootstrap

- Codex: read this file and route task-specific skills through
  `.agent-system/registry/codex-skill-map.md`.
- Antigravity: read root `GEMINI.md`, this file, then task-relevant
  `.agents/skills`.
- Cursor: use this file plus native `.cursor/rules`, `.cursor/skills`, and
  `.cursor/agents`.

Do not load another platform's private adapter unless the task explicitly
requires that platform.

## First-Run Project Customization Gate

Before the first mutation after installing or upgrading this kit:

1. Remain read-only and inspect the repository source, manifests, architecture,
   conventions, tests, delivery configuration, existing rules, and knowledge files.
2. Separate discovered `FACT` values from user-owned `DECISION` values and
   unresolved gaps. Never substitute generic defaults for missing project facts.
3. Ask the user only for information and decisions that cannot be established
   from source, including business/domain rules, ownership, risk tolerance,
   authorization boundaries, delivery approvals, and intended agent platforms.
4. Customize every canonical file under `docs/agent-rules/`, set its status to
   `VERIFIED`, and record evidence source, decision owner, and verification date.
5. Review all ten rows in `.agent-system/registry/capability-coverage.json`;
   record each as `covered`, explicit `gap`, or `not-applicable`, then refresh
   desired state and selection evidence.
6. Run `node scripts/rulekit-doctor.mjs`. Until it
   passes, answer discovery questions only; do not implement, commit, push,
   deploy, migrate, or mutate runtime systems.

## Session Start

1. Read this file.
2. Read `.agent-system/policies/task-classification.md`, state the proposed class/signals/reason/next action, then run its matching preflight command. Use `--simple` only for read-only questions.
3. Load context by task shape:
   - For implementation, review, refactor, debugging, or architecture work: read `docs/agent-rules/project-profile.md`, `docs/agent-rules/code-conventions.md`, AND `docs/agent-rules/project-structure.md` before acting. Read `docs/agent-rules/domain-glossary.md` when business terms, data meaning, permissions, reports, or cross-module contracts are involved.
   - For documentation work: additionally read `docs/agent-rules/markdown-conventions.md`.
   - For read-only questions: keep minimal context and run `node scripts/agent-preflight.mjs --simple`.
4. Read only the task-relevant capability map and one to three matching skills.
5. For existing handover/todo chains, read only the numerically highest suffix unless history is requested.
6. Use a visible checklist for multi-step work.

## Request Classifier

- Question: read-only; run `--simple`, answer with evidence, and do not edit files.
- Basic change: prove `single_domain` and `small_reversible`; establish a basic receipt, execute immediately in the smallest safe scope, verify, and close.
- Complex change: establish a planning receipt, create a plan artifact, pass `agent-plan-gate`, then execute with checkpoints.
- Critical change: any auth/RBAC, DB/data mutation, production/deploy, secrets/permissions, history rewrite, cross-system, or concurrency/jobs signal; require user-confirmed classification and approved critical plan before mutation.
- User selection may raise the class but cannot downgrade a detected critical signal.

## Core Rules

- Safe write: read before write, patch small, inspect diff/status, stop on lost
  untracked content.
- Verification: terminal checks are source of truth; IDE diagnostics are
  supplemental.
- Progress visibility: use native task list or concise chat checklist.
- Multi-agent safety: concurrent writers need explicit non-overlap or isolation.
- Security: never commit secrets, credentials, tokens, PII, or sensitive logs.
- Delivery safety: before Git mutation, deployment, VM, service, migration-apply, or rollback operations, read `docs/agent-rules/delivery-profile.md`; perform read-only discovery first and require action-specific authorization.
- Value gate: resource-heavy work must explain benefit, why now, and evidence.
- Project knowledge loop: Make a mandatory phase-close declaration (`KNOWLEDGE_IMPACT CHANGED|NO_CHANGE|UNRESOLVED`) after implementation, review, refactoring, or debugging. Every complex-task close must update the current handover and todo chain heads and reconcile the single `tasks/pending_todo.md`; the phase-close script enforces their actual hash changes. Update convention files only for stable, reusable knowledge.
- Skill authoring: before creating, merging, splitting, or materially revising a skill, read `.agent-system/policies/skill-authoring-standard.md` and validate the catalog.

## Skill Routing

Use `.agent-system/registry/skills.json` and
`.agent-system/registry/codex-skill-map.md`. Load only relevant skills.
Respect registry invocation metadata: `user` requires explicit user selection,
`model` is selected by internal routing, and `both` permits either path.
Model-discoverable `triggerBranches` are exclusive ownership boundaries.

## Agent Routing

Use `.agent-system/registry/agents.json`. Delegate only when the task has a
clear owner, inputs, outputs, and file boundaries.
