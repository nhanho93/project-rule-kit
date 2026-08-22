---
name: anti-monolith-clean-code
description: Use when splitting large files, reducing monolith modules, untangling responsibilities, or enforcing maintainable code boundaries.
---

# Anti Monolith Clean Code

Split code by stable responsibility and dependency direction while preserving
behavior. File length is a signal; the root problem is mixed ownership or change
coupling.

## When to Use

Use when modules mix policies, I/O, orchestration and presentation; when changes
repeatedly touch unrelated behavior; or when dependency cycles block testing.
Read architecture, callers, exports, tests and runtime wiring first.

Do not split a cohesive file only to satisfy a line target. Do not combine a
behavior change with a broad reorganization unless the tracer requires both.

## Refactor Workflow

1. Characterize current public behavior and identify all callers/consumers.
2. Map responsibilities, state ownership, side effects and dependency arrows.
3. Choose one extraction seam with a narrow contract and no circular back-edge.
4. Move behavior without semantic edits; keep compatibility adapters where a
   single atomic cutover is unsafe.
5. Run focused characterization after each extraction, then integration and
   build gates on the combined candidate.
6. Search for duplicate old paths, dead exports and bypasses before removing the
   compatibility layer.

## Limitations and Stop Conditions

- Smaller files can still hide duplicated policy or distributed state.
- Abstraction adds cost when only one stable caller exists.
- Stop when public behavior, ownership, test oracle or rollback boundary is
  unknown.

## Example

```text
Monolith symptom: one handler validates input, authorizes, queries, formats and emails.
Tracer: extract pure authorization policy first; characterize allow/deny callers.
Not done: rename every module or redesign email behavior in the same slice.
```

Completion requires behavior parity, acyclic dependency direction, bounded
modules with named ownership and zero unexplained old-path references.
