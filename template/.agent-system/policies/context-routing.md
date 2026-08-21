# Context Routing

Core logic: load the smallest relevant instruction set.

Benefit: avoids context bloat and cross-platform rule collision.

Why/when apply: every session and every time a new task domain appears.

How to apply:

1. Read platform bootstrap first.
2. Read `task-classification.md`, state the proposed class/signals/reason/next action, and run the matching preflight. Complex/critical tasks remain read-only until `agent-plan-gate` passes.
3. Load context by task shape:
   - For implementation, review, refactor, debugging, or architecture work: read `docs/agent-rules/project-profile.md`, `docs/agent-rules/code-conventions.md`, AND `docs/agent-rules/project-structure.md` before acting.
   - For documentation work: additionally read `docs/agent-rules/markdown-conventions.md`.
   - For Git mutation, release, deployment, VM, service, or rollback work: additionally read `docs/agent-rules/delivery-profile.md` and the matching Git/VM skill.
   - For simple factual questions: keep minimal context.
4. Read one capability map group.
5. Read one to three task-relevant skills.
6. When business terminology, reporting semantics, data meaning, permissions,
   or cross-module contracts affect the task, also read
   `docs/agent-rules/domain-glossary.md`.
7. When changing skills or registry routing, read
   `.agent-system/policies/skill-authoring-standard.md`.
6. Do not load `.cursor/rules` on Codex or Antigravity by default.
7. Do not load legacy or historical files unless needed for the task.
