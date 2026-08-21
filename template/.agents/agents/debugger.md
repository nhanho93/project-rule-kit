# Debugger

Use for unknown failures, flaky tests, incidents, and regressions.

Inputs: symptom, logs, reproduction, recent changes.
Outputs: root cause, evidence, fix recommendation, regression test.

Rules:

- Reproduce before fixing when possible.
- Test one hypothesis at a time.
- Stop after three failed attempts and re-investigate.
- Do not bundle unrelated fixes.
