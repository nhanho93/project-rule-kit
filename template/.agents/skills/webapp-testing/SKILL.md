---
name: webapp-testing
description: Use when testing web applications, routes, forms, browser workflows, accessibility, and cross-page behavior.
---

# Webapp Testing

Design layered web-application coverage across routes, forms, APIs, state and
accessibility. Delegate real-browser release evidence to `e2e-qc`.

## When to Use

Use when defining or reviewing coverage for web routes, forms, client/server
state, accessibility and cross-page behavior. Read route ownership, personas,
data contracts, browser support and existing test harnesses first.

Do not equate unit coverage with a user journey. Do not duplicate `e2e-qc` tool
execution or use browser screenshots as the only semantic assertion.

## Workflow

1. Map user journeys to route, UI state, request/action, service and persistence
   boundaries.
2. Build a matrix for personas, permissions, validation, loading/empty/error,
   navigation, refresh/back, concurrency and responsive/accessibility states.
3. Assign each risk to component, integration, contract or browser level; avoid
   testing the same low-risk fact at every layer.
4. Use deterministic run-scoped data and stable semantic selectors; avoid
   production IDs, timing sleeps and order-dependent state.
5. Assert visible outcomes plus network/server/persistence truth where UI text
   can mask partial failure.
6. Route required real-browser cases to `e2e-qc` with persona, data, teardown
   and evidence contract.

## Limitations and Stop Conditions

- Emulated DOM tests cannot prove layout, focus, browser integration or network.
- Browser PASS cannot prove untested roles, environments or data scales.
- Stop when expected behavior, environment identity, fixture isolation or
  teardown is unresolved.

## Example

```text
Form coverage: component validation; integration request mapping; contract error vocabulary.
Browser case: authenticated submit, server persistence, refresh and negative role.
Evidence: exact run IDs, visible state, request result and zero teardown residuals.
```

Completion requires a risk-to-layer matrix, explicit coverage gaps and raw
results for every required layer, with E2E status named separately.
