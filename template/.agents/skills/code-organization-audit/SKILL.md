---
name: code-organization-audit
description: Use when auditing repository structure, cleanup needs, dependency risk, source organization, or maintainability hotspots.
---

# Code Organization Audit

Produce an evidence-backed maintainability map. An audit diagnoses and
prioritizes; it does not authorize a repository-wide refactor.

## When to Use

Use for structure reviews, ownership ambiguity, dependency tangles, duplicate
implementations, oversized modules or suspected architectural drift. Read the
project structure, conventions, entrypoints and build/test manifests first.

Do not use for a known one-file defect or as a pretext for stylistic churn.

## Audit Workflow

1. Define scope and stable boundaries: runtime entrypoints, domains, adapters,
   generated code, tests and delivery scripts.
2. Inventory import/dependency directions and locate cycles, cross-domain writes,
   duplicate policy logic, public APIs and change hotspots.
3. Trace representative behavior through callers and consumers; file size alone
   is not root-cause evidence.
4. Separate findings into correctness, change-risk, discoverability and hygiene.
   Attach exact paths and the failure mechanism to every finding.
5. Rank by impact, recurrence and safe extraction boundary. Propose tracer
   refactors that preserve behavior and can be verified independently.
6. Challenge the proposal against tests, ownership, migration compatibility and
   rollback. Record areas inspected with no finding to show coverage.

## Limitations and Stop Conditions

- Static imports do not reveal all runtime coupling, reflection or data contracts.
- Large files are not automatically defects; small duplicated policies can be
  higher risk.
- Stop before implementation when ownership, public API compatibility or the
  verification surface is unknown.

## Example

```text
Finding: three route handlers duplicate the same scope predicate.
Evidence: exact callers differ on deleted-record filtering.
Risk: list/detail parity bug, not merely file length.
Tracer refactor: extract one policy, characterize all three old paths, migrate one caller.
```

Completion requires a scoped inventory, evidence-linked findings, prioritized
actions, non-goals and an owner/next action for every unresolved hotspot.
