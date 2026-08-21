# Verification

Core logic: claims require evidence.

Benefit: prevents false completion and catches regressions before handoff.

Why/when apply: before saying work is complete, fixed, reviewed, safe, or ready
to push/deploy.

How to apply:

1. Select the smallest relevant checks from `project-profile.md`.
2. Run terminal checks as the source of truth.
3. Use IDE diagnostics as supplemental evidence.
4. Report exact checks and result.
5. If a check cannot run, state why and the remaining risk.
