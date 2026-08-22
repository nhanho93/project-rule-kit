---
name: database-design
description: Use when designing schemas, relationships, indexes, query patterns, persistence boundaries, or data ownership.
---

# Database Design

Design persistence around data meaning, ownership and access paths before
choosing tables or indexes. Preserve invariants across writes, reads and retries.

## When to Use

Use for new schemas, relationships, constraints, indexes, query shapes or data
ownership decisions. Read the domain glossary, existing schema, migrations,
queries and retention/authorization rules first.

Do not use this skill to apply a migration; use `database-migration-safety` for
delivery. Do not redesign a schema from an ORM model without checking DB truth.

## Design Workflow

1. Define entities, lifecycle, source of truth, ownership and required history.
2. List invariants and invalid states; decide which belong in constraints,
   transactions, application policies or asynchronous reconciliation.
3. Trace write paths, read paths, cardinality and expected scale. Include null,
   inactive, deleted, duplicate, retry and concurrency cases.
4. Normalize for integrity, then denormalize only for a measured read need with
   an explicit refresh/recovery contract.
5. Design keys, foreign keys and indexes from actual predicates and ordering;
   check selectivity, write cost and uniqueness semantics.
6. Specify migration compatibility, backfill, rollback/recovery and query-plan
   evidence before implementation.

## Limitations and Stop Conditions

- Estimated scale and guessed queries cannot justify permanent complexity.
- Cross-database consistency cannot be made transactional by schema alone.
- Stop when data ownership, deletion semantics, target database or migration
  ordering is unresolved.

## Example

```text
Requirement: retrying a projection must not create a second row.
Design: stable source UUID plus UNIQUE(source_type, source_id).
Negative case: two concurrent retries; one insert wins and one resolves existing state.
Proof: constraint inspection, concurrency test and idempotent reapply plan.
```

Completion requires an entity/relationship map, invariants, access paths,
constraint/index rationale, migration approach and unresolved owner/actions.
