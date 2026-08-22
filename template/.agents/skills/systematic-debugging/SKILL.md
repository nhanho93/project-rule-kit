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

## Limitations and Stop Conditions

- Do not implement a speculative fix before reproducing the symptom or collecting
  equivalent production evidence.
- Do not broaden scope after a failed hypothesis without returning to the
  observation/unknown list.
- Stop after three failed fix attempts, preserve evidence, and restart root-cause
  analysis or escalate the missing observability/decision.

## Example

If a scheduled report intermittently duplicates rows, first correlate run IDs,
locks, retries, query cardinality, and timestamps. Test separate hypotheses of
duplicate scheduling, non-idempotent writes, and join multiplication. Fix only
the confirmed cause and add a regression test that fails without the fix.

Completion: evidence identifies one root cause, the smallest fix removes the
reproduction, the regression test proves it, and residual unknowns are recorded.
