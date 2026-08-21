# Project Knowledge Loop

Core logic: preserve stable lessons learned in a task.

Benefit: the project becomes smarter without loading huge context files.

Why/when apply: every time a task completes implementation, review, refactoring, or debugging.

How to apply:
1. Run the phase-close hard gate script before closing: `node scripts/agent-phase-close.mjs --task-id <ID> --manifest "<PATH>"`
2. `CHANGED`: verified update.
3. `NO_CHANGE`: verified no reusable knowledge with reason.
4. `UNRESOLVED`: conflict/insufficient evidence and owner/next action.
5. Only add stable knowledge. Avoid documentation churn and do not write one-off task notes.
6. Target files:
   - Code conventions: `docs/agent-rules/code-conventions.md`
   - Markdown conventions: `docs/agent-rules/markdown-conventions.md`
   - Structure/Architecture: `docs/agent-rules/project-structure.md`
   - Domain language and invariants: `docs/agent-rules/domain-glossary.md`
