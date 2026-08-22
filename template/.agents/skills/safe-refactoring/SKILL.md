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

## Limitations and Stop Conditions

- Do not call a behavior change a refactor; split it into a separately specified
  and tested change.
- Avoid broad rename/format churn that makes semantic review or rollback hard.
- Stop when characterization coverage is insufficient, a public contract would
  change, or ownership of affected callers is unresolved.

## Example

Before splitting a large import service, add characterization tests for accepted
aliases, validation errors, duplicate handling, and transaction behavior. Move
one responsibility at a time behind the same public function, rerun focused
tests after each move, and confirm the final diff changes structure only.

Completion: characterization and broader checks remain green, public behavior is
unchanged, and the diff contains only the declared structural improvement.
