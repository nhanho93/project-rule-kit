---
name: python-patterns
description: Use when writing or reviewing Python scripts, CLIs, data processing, automation, or test utilities.
---

# Python Patterns

Write Python with explicit environment, types/contracts, resource ownership and
deterministic data/error behavior that matches the repository toolchain.

## When to Use

Use for Python scripts, CLIs, automation, data processing or test utilities.
Inspect supported Python version, dependency/lock tooling, package layout and
existing lint/type/test commands first.

Do not install packages globally, rely on implicit working directories or use a
Python script to replace a simpler repository-native operation without benefit.

## Workflow

1. Define inputs, outputs, exit codes, encoding, time zone and side effects.
2. Separate pure transformation from I/O; validate external data at boundaries.
3. Use context managers for files/connections and bounded iteration/streaming for
   large data; avoid hidden mutable globals.
4. Preserve domain-specific exceptions, add actionable context and never log
   secrets or full sensitive rows.
5. Make retryable side effects idempotent and cleanup deterministic.
6. Test empty/malformed input, Unicode, path spaces, partial failure, repeat run
   and supported-version behavior.

## Limitations and Stop Conditions

- Type hints do not validate runtime input by themselves.
- Local environment success does not prove lockfile or platform compatibility.
- Stop when interpreter/dependency ownership, data sensitivity or output
  compatibility is unresolved.

## Example

```python
def normalize(rows):  # pure and directly testable
    return [row.strip() for row in rows if row.strip()]

with input_path.open(encoding="utf-8") as handle:
    result = normalize(handle)
```

Completion requires reproducible environment/commands, bounded resources,
typed/tested boundaries and deterministic exits/cleanup.
