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
