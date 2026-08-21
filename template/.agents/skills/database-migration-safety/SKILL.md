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
