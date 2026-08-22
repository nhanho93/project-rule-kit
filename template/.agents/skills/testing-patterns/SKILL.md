---
name: testing-patterns
description: Use when designing tests, fixtures, assertions, integration coverage, regression tests, or test strategy.
---

# Testing Patterns

Choose the lowest test layer that proves the behavior contract, then add the
fewest higher-layer tests needed for boundaries that lower layers cannot see.

## When to Use

Use for test strategy, regression characterization, fixtures, assertions,
integration boundaries and coverage gaps. Start from behavior and failure risk,
not from the implementation function name.

Do not use this skill to execute browser journeys; route those to `e2e-qc`. Do
not chase coverage percentage with assertions that cannot fail meaningfully.

## Workflow

1. State the behavior, rejected old behavior and invariant in observable terms.
2. Build a risk matrix covering positive, negative, boundary, authorization,
   retry/concurrency, time/environment and partial-failure branches that apply.
3. Select unit tests for pure decisions, integration tests for persistence and
   boundaries, contract tests for producer/consumer vocabulary, and E2E only for
   user paths that require a real browser.
4. Create deterministic run-scoped fixtures. Avoid shared IDs, production data,
   hidden clock/timezone dependencies and order-dependent cleanup.
5. Make at least one characterization fail on the rejected behavior before the
   fix. Assert exact IDs/fields when counts can hide row-set drift.
6. Run focused then relevant suite-level tests; prove teardown in `finally` for
   mutating integration cases.

## Limitations and Stop Conditions

- Mocks cannot prove integration contracts they replace.
- Snapshots cannot prove authorization, side effects or semantic correctness.
- Stop when expected behavior is disputed, fixtures cannot be isolated, or the
  chosen layer cannot observe the failure mechanism.

## Example

```text
Contract: exported dropdown values must be accepted by the import parser.
Bad test: formatter and parser each match their own hard-coded fixture.
Good test: generate the actual workbook value, feed it into the parser, and assert persisted canonical data.
```

Completion requires traceability from every high-risk contract to an assertion,
raw test results and explicit coverage gaps with owner/next action.
