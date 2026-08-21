---
name: project-knowledge-update
description: Use after implementation, review, refactor, debugging, or structure changes when reusable project knowledge may have changed.
---

# Project Knowledge Update

Core logic: stable lessons become project memory.

Benefit: agents improve over time without loading old conversations.

Why/when apply: repeated bug pattern, new convention, changed folder ownership, new command, new build/deploy/test constraint.

## Evidence Hierarchy
When facts conflict, rely on evidence in this priority:
1. Executable manifests/config/schema/source/imports/tests/CI-deploy config
2. Maintained docs
3. Explicit operator decision

## Safe-Write and Update Policies
- **Conflict behavior**: Record ambiguity as `UNRESOLVED` (or `REVIEW_REQUIRED`) rather than guessing. Do not silently overwrite explicit human decisions.
- **Safe-write/Idempotent patch**: Use code editing tools safely to preserve manual content. Updates should be additive or corrective and idempotent.
- **Required metadata**: Ensure all updated knowledge includes freshness metadata (`last_verified`), `evidence/source`, `impacted_modules`, `decision_owner`, and requires validation.

## Phase Close Classification
Ensure the mandatory `KNOWLEDGE_IMPACT` declaration is semantically consistent:
- `CHANGED`: verified update.
- `NO_CHANGE`: verified no reusable knowledge with reason.
- `UNRESOLVED`: conflict/insufficient evidence and owner/next action.
Enforce this by running the exact supported phase-close command: `node scripts/agent-phase-close.mjs --task-id <id> --manifest <path>`.
Before that command, every complex task must update the active handover and todo chain heads and reconcile the single live `tasks/pending_todo.md`. Do not treat these three continuity surfaces as optional documentation.

How to apply:
1. Analyze the completed task for new conventions, patterns, or structural changes.
2. Formulate the impact statement `KNOWLEDGE_IMPACT CHANGED|NO_CHANGE|UNRESOLVED` with evidence.
3. Update specific files based on the domain:
   - Code work: `docs/agent-rules/code-conventions.md`
   - Documentation work: `docs/agent-rules/markdown-conventions.md`
   - Structural/architectural work: `docs/agent-rules/project-structure.md`
   - Domain terms, aliases, and semantic invariants: `docs/agent-rules/domain-glossary.md`
   - Git, release, deployment, runtime, or VM conventions: `docs/agent-rules/delivery-profile.md`
4. Update `docs/agent-rules/project-profile.md` only for broad project facts.
5. Do not add one-off task notes or cause documentation churn. Target stable knowledge only.
