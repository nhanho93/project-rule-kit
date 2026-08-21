---
name: systematic-debugging
description: Use when facing a bug, failing test, flaky behavior, unexpected output, production incident, or unclear root cause.
---

# Systematic Debugging

Core logic: diagnose before fixing.

Benefit: avoids patches that only hide symptoms.

Why/when apply: failures, flakes, regressions, confusing logs, performance
surprises, inconsistent user reports.

How to apply:

1. Reproduce or capture the exact symptom.
2. List observations and unknowns.
3. Form one hypothesis at a time.
4. Collect evidence that can falsify the hypothesis.
5. Fix the smallest confirmed root cause.
6. Add or update a regression test.
7. After three failed attempts, stop and re-investigate from evidence.

Do not change multiple unrelated causes in one patch.
