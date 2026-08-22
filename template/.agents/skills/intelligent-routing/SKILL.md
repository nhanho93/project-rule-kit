---
name: intelligent-routing
description: Use when selecting the right skill, agent, workflow, or specialist for an ambiguous or multi-domain task.
---

# Intelligent Routing

Select the smallest capability set that fully owns the request. Routing ends
with an executable context contract; it does not perform the selected work.

## When to Use

Use when the request is ambiguous, crosses domains, names no clear workflow, or
could activate competing skills. First classify the task and its risk signals,
then inspect the registry metadata and project capability map.

Do not use when the user explicitly invokes one valid skill and no safety or
dependency conflict exists. Load that skill directly. Do not use routing to
downgrade critical work, bypass user-only invocation, or load a broad catalog.

## Routing Procedure

1. Rewrite the request as observable outcomes, mutations and evidence needs.
2. Identify risk signals before capability names: authorization, data, deploy,
   concurrency, browser behavior and external side effects.
3. Find candidate `triggerBranches`; reject candidates whose anti-scope owns a
   different outcome or whose `invocationMode` forbids model selection.
4. Choose one primary skill. Add a secondary skill only for a necessary gate or
   distinct supporting capability. Resolve `requires` and `conflictsWith`.
5. Load only the selected entrypoints and their conditionally required
   references. State why each capability is needed and what it owns.
6. Verify that every requested outcome, mutation and QC surface has one owner;
   unresolved overlap or an uncovered branch blocks execution.

## Limitations and Stop Conditions

- Routing metadata can be stale; source and project rules override assumptions.
- Similar names are not evidence of duplicate capability ownership.
- Stop when a critical signal lacks an authorized workflow, two
  model-discoverable skills own the same branch, or a required capability is
  missing. Record the gap instead of improvising a generic substitute.

## Example

```text
Request: "Change a permission query and prove the UI scope."
Primary: planning workflow (multi-file authorization change).
Required gates: database design + browser E2E.
Rejected: lint-only routing, because static checks cannot prove data scope.
Completion: every outcome and QC surface has one named owner and no conflict.
```

Routing is complete only when the classification, selected skills, rejected
alternatives, required context and uncovered gaps are explicit.
