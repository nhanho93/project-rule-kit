---
name: code-review-checklist
description: Use when reviewing code, patches, pull requests, generated changes, implementation plans, or agent output.
---

# Code Review Checklist

Review the same change through two independent lenses:

- **Standards**: conformity with repository rules, architecture, security,
  maintainability, and verification conventions.
- **Spec**: fidelity to the requested behavior, acceptance criteria, scope, and
  important negative cases.

Read [references/two-axis-review.md](references/two-axis-review.md) before a
substantive review.

Completion requires both axes to report evidence-backed findings or an
explicit PASS with residual risk. Keep the axes separate: clean code does not
prove correct behavior, and correct behavior does not excuse a standards
violation.

## When to Use

Use after a patch, plan, generated implementation, pull request, or agent wave
needs independent acceptance. Review the requested diff and its affected
callers/data paths; debug first when there is only a symptom and no candidate
change to review.

## Limitations and Stop Conditions

- Review is read-only unless the user separately authorizes implementation.
- Passing tests do not prove spec coverage; clean style does not prove correct
  rules, permissions, persistence, or negative cases.
- Stop acceptance when evidence is missing, unrelated diffs obscure the patch,
  or a blocking finding lacks an owner and next action.

## Example

For an export filter change, the Standards axis checks authorization placement,
query safety, project conventions, and focused tests. The Spec axis traces
report output -> predicates -> source rows and back again, including deleted,
co-owned, empty, boundary-time, and unauthorized cases. Keep a separate result
and residual risk for each axis.
