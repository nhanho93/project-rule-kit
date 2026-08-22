---
name: app-builder
description: Use when creating or extending an application, feature slice, prototype, or end-to-end vertical workflow.
---

# App Builder

Deliver one vertical behavior slice through the project's existing architecture,
from user/input boundary to persisted or observable outcome.

## When to Use

Use after the outcome and major decisions are approved for a new application,
feature slice or prototype. Load planning/architecture skills first when scope,
ownership, stack or delivery boundary is still open.

Do not scaffold an entire stack when a smaller slice proves the core risk. Do
not bypass project conventions, auth, data ownership or delivery gates.

## Build Workflow

1. Lock the persona, trigger, expected outcome, non-goals and acceptance evidence.
2. Trace the thinnest vertical path across UI/API/service/data or equivalent
   layers; name every contract and owner.
3. Reuse project components and patterns. Add a dependency only after checking
   existing capability, lifecycle, security and bundle/runtime cost.
4. Implement the tracer with input validation, authorization, errors,
   observability and idempotent side effects where retry applies.
5. Cover success, negative permission/validation, boundary and partial-failure
   cases at the lowest proving layer; add E2E for browser-visible flows.
6. Verify the integrated slice before expanding breadth, polish or automation.

## Limitations and Stop Conditions

- A generated scaffold is not a production architecture or security review.
- A prototype does not imply migration, scale or support readiness.
- Stop when product decisions, data ownership, auth boundary or test/deploy
  environment is unresolved.

## Example

```text
Goal: prove a user can submit and retrieve one request.
Tracer: one form -> validated action -> stored record -> detail state.
Deferred: admin analytics, bulk import and notification fan-out.
Proof: exact record round-trip, negative actor denial and teardown.
```

Completion requires one end-to-end accepted behavior, raw verification evidence,
documented deferred scope and an owner for every remaining production gap.
