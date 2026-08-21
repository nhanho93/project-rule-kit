---
name: safe-refactoring
description: Use when restructuring code, splitting files, renaming APIs, reducing duplication, or changing internals while preserving behavior.
---

# Safe Refactoring

Core logic: preserve behavior while improving structure.

Benefit: makes code easier to change without hidden regressions.

Why/when apply: large files, duplicated logic, tangled responsibilities,
renames, module moves, performance-neutral cleanup.

How to apply:

1. Identify the behavior that must remain stable.
2. Add or run characterization tests before structural edits.
3. Move in small steps.
4. Keep public interfaces stable unless explicitly changing them.
5. Run focused tests after each meaningful step.
6. Use diff review to confirm the change is structural, not accidental behavior.
