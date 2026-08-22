---
name: database-migration-safety
description: Use when changing schemas, migrations, seed data, data backfills, database env vars, or persistence behavior.
---

# Database Migration Safety

Core logic: data changes need target, idempotency, and rollback thinking.

Benefit: prevents accidental production mutation and migration drift.

Why/when apply: schema changes, migrations, backfills, destructive updates,
env var changes, ORM schema changes.

How to apply:

1. Confirm target database and environment.
2. Default to non-production unless explicitly approved.
3. Make DDL idempotent when possible.
4. Separate schema change, data backfill, and application behavior.
5. Run project migration checks.
6. Document apply order, rollback, and production approval needs.

## Limitations and Stop Conditions

- Never infer production authorization from permission to edit or commit a
  migration; applying it is a separate action.
- Avoid destructive contract steps until all readers/writers have migrated and
  compatibility evidence passes.
- Stop when target database, backup/recovery, lock impact, row volume, or rollback
  owner is unknown.

## Example

For a required canonical identifier, first add a nullable column and compatible
writer, then backfill in bounded idempotent batches, verify duplicates/nulls,
add the constraint/index, switch readers, and only later remove the legacy field.
Record separate DEV and PROD targets plus exact apply and rollback gates.

Completion: target and order are explicit, compatibility and data checks pass,
rollback/recovery is owned, and every production apply remains separately
authorized and evidenced.
