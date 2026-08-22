---
name: brainstorming
description: Use when shaping an idea, feature, product flow, architecture option, or implementation approach before detailed planning.
---

# Brainstorming

Turn an open decision space into a small set of evidence-backed choices before
planning. Preserve facts, user-owned decisions and assumptions separately.

## When to Use

Use when the desired outcome is known but the solution, flow, scope or tradeoff
is still open. Read the project profile, relevant source and prior decisions
before asking questions that the repository can already answer.

Do not use to reopen an approved specification, delay an urgent deterministic
fix, or silently turn ideation into implementation authorization.

## Workflow

1. State the decision to make, affected users and measurable outcome.
2. Build a facts-versus-decisions table. Mark missing evidence and the owner of
   every product, risk or investment decision.
3. Ask only high-leverage questions whose answers change scope or choice.
4. Generate two or three materially different options, including the smallest
   viable option and the option of making no change.
5. Challenge each option for root cause, dependencies, reversibility, failure
   modes, user behavior, operational cost and verification feasibility.
6. Recommend one option with explicit tradeoffs, rejected alternatives and the
   decisions still required before planning.

## Limitations and Stop Conditions

- Brainstorming does not replace source discovery, a buildable plan or approval.
- Do not invent market facts, architecture facts or user preferences.
- Stop when the core problem lacks evidence, options collapse into the same
  solution, or an unresolved decision would materially change implementation.

## Example

```text
Decision: reduce failed spreadsheet imports.
Fact: errors cluster around dynamic lookup values.
Options: static template, environment-generated template, or guided web import.
Challenge: a static template cannot preserve environment-specific catalogs.
Recommendation: environment-generated template; owner must confirm legacy-file policy.
```

Completion means the user can approve one option without rediscovering facts,
tradeoffs, unresolved decisions or downstream verification needs.
