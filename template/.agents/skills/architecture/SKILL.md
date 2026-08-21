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
