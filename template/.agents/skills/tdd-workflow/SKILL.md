---
name: tdd-workflow
description: Use when implementing a feature, bugfix, behavior change, parser, workflow, or risky refactor before writing implementation code.
---

# TDD Workflow

Core logic: prove desired behavior with a failing test before implementation.

Benefit: prevents tests from merely documenting the code you already wrote.

Why/when apply: new behavior, bugfixes, regression fixes, business logic,
parsers, state transitions, risky refactors.

How to apply:

1. State the behavior in one sentence.
2. Write the smallest failing test that proves it.
3. Run the test and confirm it fails for the expected reason.
4. Implement the minimum code to pass.
5. Run the focused test, then relevant broader checks.
6. Refactor only after green.

If code was written first, pause and add a test that would have failed against
the previous behavior. Record the reason for the deviation.

## Limitations and Stop Conditions

- Do not write a test that mirrors implementation details or already passes
  before the intended behavior exists.
- TDD does not replace integration, migration, security, or browser verification
  required by the changed boundary.
- Stop when expected behavior or its oracle is ambiguous; resolve the spec before
  encoding a possibly wrong contract.

## Example

For a timezone boundary bug, write a focused test using the failing timestamp and
expected business date, run it to confirm old code fails for that reason, then
make the smallest normalization change. Run the focused test and adjacent
date-range suite before refactoring duplicated helpers.
