---
name: plan-master
description: Use when creating a master plan, phased roadmap, implementation sequence, or GO/NO-GO proposal.
---

# Plan Master

Create a multi-wave SSOT only after read-only discovery establishes the current
system, rules, data flow, owners, risks, and verification surfaces.

Use `planning-workflow` and its
[plan artifact contract](../planning-workflow/references/plan-contract.md).

For multi-wave work:

1. Define goal, non-goals, classification, signals, dependencies, and explicit authorization boundaries.
2. Trace output → logic/rules → input/source and reverse input → processing → output where correctness depends on end-to-end semantics.
3. Split work into tracer waves that each deliver an independently verifiable
   behavior. Declare stable wave IDs, blocking edges, implementation scope,
   acceptance criteria, code QC, E2E decision, evidence, rollback, and GO/NO-GO
   gate. Use expand/migrate/contract only for indivisible wide migrations.
4. Keep one current execution pointer; do not let later waves start before the prior gate passes.
5. Reconcile handover, todo, pending work, knowledge impact, owner, and next action at every wave close.
6. Pass `agent-plan-gate` before any project mutation and refresh it after material plan changes.
