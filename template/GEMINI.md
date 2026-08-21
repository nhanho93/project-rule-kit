# Antigravity Entry

Antigravity must treat root `AGENTS.md` as P0.

At session start:

1. Read `AGENTS.md`.
2. Enforce `AGENTS.md`'s First-Run Project Customization Gate. Inspect source,
   ask the user only for unresolved project decisions, and block mutation until
   `node scripts/check-project-customization.mjs --installed` passes.
3. Read `.agent-system/policies/task-classification.md`, state the proposed class/signals/reason/next action, and run the matching preflight. Complex/critical tasks must pass `agent-plan-gate` before mutation.
4. Read `docs/agent-rules/project-profile.md`.
5. Read `.agent-system/registry/README.md`.
6. Load only the task-relevant capability map.
7. Load only task-relevant canonical skills from `.agents/skills`.
8. For Git mutation, deployment, VM, service, or rollback work, read `docs/agent-rules/delivery-profile.md` and the matching Git/VM canonical skill before acting.
9. For skill creation, merge, split, or material revision, read `.agent-system/policies/skill-authoring-standard.md` before editing the catalog.

Do not read `.cursor/rules/*.mdc` by default. Read
`docs/agent-rules/platform-adapters.md` only when a platform fallback is needed.
Honor `.agent-system/registry/skills.json`: `user` skills require explicit
selection, `model` skills are internal routes, and `both` supports either.
