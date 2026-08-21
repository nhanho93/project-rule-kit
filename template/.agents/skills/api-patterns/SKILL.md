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
