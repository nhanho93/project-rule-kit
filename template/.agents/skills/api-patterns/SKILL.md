---
name: api-patterns
description: Use when designing, editing, testing, or reviewing API routes, service boundaries, webhooks, schemas, or integration contracts.
---

# API Patterns

Core logic: make contracts explicit and test edge cases.

Benefit: prevents silent breaking changes across clients and integrations.

Why/when apply: endpoints, webhooks, SDK functions, request/response schemas,
auth/permission checks, rate limits, external integrations.

How to apply:

1. Identify consumers and compatibility expectations.
2. Define request, response, errors, auth, permissions, and idempotency.
3. Validate inputs at the boundary.
4. Keep business logic out of thin route handlers when the project has services.
5. Test success, validation failure, permission failure, and idempotency when
   relevant.
6. Update docs when external behavior changes.

## Limitations and Stop Conditions

- Do not introduce a new API style or compatibility break without consumer
  evidence and an explicit migration decision.
- This skill defines boundary contracts; load the project database, security,
  or deployment skill for persistence, authorization, or rollout changes.
- Stop when the owning consumer, error semantics, or backward-compatibility
  requirement cannot be established from source or an operator decision.

## Example

For a retryable webhook, document the authenticated request schema, stable
event ID, duplicate response, retryable versus terminal errors, and permission
failure. Add tests showing that the first delivery mutates once, a repeated
event returns the agreed response without a second mutation, and an invalid
signature is rejected before business logic runs.

Completion: every affected consumer has a compatible contract and the declared
success, validation, authorization, error, and retry/idempotency cases have
observable test evidence.
