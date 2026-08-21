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
