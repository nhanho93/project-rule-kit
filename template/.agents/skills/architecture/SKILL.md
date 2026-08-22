---
name: architecture
description: Use when making structural decisions, choosing patterns, defining boundaries, or reviewing system design trade-offs.
---

# Architecture

Protect stable module ownership, small public contracts, and concentrated
business logic.

1. Read the project profile, structure map, relevant ADRs, source dependency
   direction, tests, and domain glossary.
2. Define the proposed module contract: inputs, outputs, invariants, error
   modes, ordering, permissions, and performance constraints callers need.
3. Apply [references/module-depth-check.md](references/module-depth-check.md)
   when adding a boundary, wrapper, shared service, repository, or cross-module
   abstraction.
4. Compare at least two viable placements when the seam is not already fixed
   by source evidence or an ADR.
5. Verify dependency direction and test behavior through the public contract.
6. Record the decision or unresolved owner when stable architecture changes.

Completion means callers learn less than the implementation hides, behavior is
testable through the intended contract, and ownership/dependency effects are
recorded with evidence.

## When to Use

Use for a new module boundary, cross-module dependency, shared abstraction,
storage/service placement, or a structural proposal that changes ownership or
dependency direction. Use a narrower implementation skill when the boundary is
already established and the task only changes behavior inside it.

## Limitations and Stop Conditions

- Do not redesign a stable boundary merely to match a preferred pattern.
- Do not hide unresolved domain semantics behind a generic repository, helper,
  or service layer.
- Stop when source evidence and ADRs conflict; record the conflict, owner, and
  decision needed before implementation.

## Example

When HTTP routes and a scheduled job calculate the same entitlement, place the
invariant in the owning domain service, keep transport/job adapters thin, and
test the public service contract. Record why a UI helper or generic shared
utility was rejected and verify dependency direction remains adapter -> domain.
