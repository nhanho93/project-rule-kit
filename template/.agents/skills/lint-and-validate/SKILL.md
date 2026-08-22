---
name: lint-and-validate
description: Use when setting up, running, fixing, or interpreting lint, type, format, schema, or repository validation checks.
---

# Lint And Validate

Run repository-native static gates, diagnose their actual cause and report
reproducible evidence. A green static gate is not proof of correct behavior.

## When to Use

Use when configuring, executing, repairing or interpreting lint, type, format,
schema, policy or repository validators. Discover commands from manifests,
hooks, CI and project rules rather than guessing tool flags.

Do not use automatic formatting or broad autofix on unrelated dirty files. Do
not substitute lint for unit, integration, browser or migration verification.

## Workflow

1. Record tool/version, working directory, config and the exact target scope.
2. Run the narrowest authoritative command before edits to distinguish baseline
   failures from regressions introduced by the task.
3. Classify each failure as source defect, configuration drift, generated-file
   issue, environment problem or out-of-scope baseline debt.
4. Fix root cause inside scope. Avoid suppressions, blanket excludes and type
   assertions unless the project contract explicitly permits them.
5. Rerun the focused gate, then the broader project-required gate when shared
   configuration or exported contracts changed.
6. Report command, exit code, counts, changed files and every remaining failure
   with owner and next action.

## Limitations and Stop Conditions

- Tool output may truncate or cache stale state; rerun with a clean scoped cache
  only when the project procedure allows it.
- Stop on unknown config ownership, a proposed suppression that widens policy,
  or failures outside scope that prevent trustworthy attribution.

## Example

```text
Focused gate: eslint changed files -> 2 errors.
Diagnosis: one real unsafe promise; one pre-existing generated-file warning.
Action: fix the promise, do not reformat generated output.
Proof: focused 0 errors; full gate retains the documented baseline warning only.
```

Completion requires reproducible commands and zero unexplained new failures;
“command ran” without exit status and scope is not evidence.
