---
last_verified: ''
evidence_sources: ''
impacted_modules: ''
decision_owner: ''
status: 'UNRESOLVED'
---

# Project Structure

Record the project's stable ownership, folder map, and dependency policies here.

## Template

| Path | Owner / Purpose | Notes |
|---|---|---|
| `src/` | Application source | Replace with project facts |
| `tests/` | Tests | Replace with project facts |
| `docs/` | Documentation | Replace with project facts |
| `.agent-system/` | Cross-platform registry and policies | Shared canonical |
| `.agents/` | Antigravity/shared skills and agents | Shared canonical |
| `.cursor/` | Cursor native adapters | Cursor only |

## Dependency Ownership

| Domain | Allowed Dependencies | Restrictions |
|---|---|---|
| Scripts | `node:fs`, `node:path`, `node:url` | Dependency-free, no external packages (e.g., in `.agent-system` scripts) |
| Core | `{{CORE_DEPS}}` | `{{CORE_RESTRICTIONS}}` |

## Feedback Loop

Update this file when a task creates, removes, renames, or meaningfully changes
folder ownership or dependency policies.
Make a mandatory phase-close declaration: `KNOWLEDGE_IMPACT CHANGED|NO_CHANGE|UNRESOLVED`.
Do not add transient build output or generated directories.
