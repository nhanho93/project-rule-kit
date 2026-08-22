---
name: clean-code
description: Use when code is hard to read, files or functions are too large, duplication appears, or responsibilities are mixed.
---

# Clean Code

Core logic: optimize for clear ownership and small units.

Benefit: future agents and humans can reason about changes with less context.

Why/when apply: bloated files, repeated logic, unclear naming, long functions,
mixed data/UI/network concerns.

How to apply:

1. Prefer existing project patterns.
2. Split by responsibility, not by arbitrary layers.
3. Add abstractions only when they remove real duplication or complexity.
4. Keep names domain-accurate.
5. Avoid broad formatting churn.
6. Update `docs/agent-rules/code-conventions.md` when a stable convention is
   learned.

## Limitations and Stop Conditions

- Do not combine behavior changes with broad cleanup unless the plan and tests
  explicitly cover both.
- Do not create abstractions for hypothetical reuse or split code into fragments
  that obscure domain ownership.
- Stop and use `safe-refactoring` when public interfaces, module boundaries, or
  behavior-preservation risk becomes material.

## Example

If a route mixes validation, a long calculation, persistence, and response
formatting, first preserve behavior with focused tests. Extract the calculation
into the owning domain module, keep validation/serialization at the boundary,
and verify the diff has no unrelated formatting or response change.

Completion: ownership is clearer, behavior evidence remains green, duplication
or mixed responsibility is measurably reduced, and no unrelated churn remains.
