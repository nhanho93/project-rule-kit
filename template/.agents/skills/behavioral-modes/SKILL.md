---
name: behavioral-modes
description: Use when choosing agent behavior such as plan, debug, review, execute, research, or orchestration mode.
---

# Behavioral Modes

Choose the operating posture that matches the user's requested outcome and
authorization. Mode selection changes actions and evidence, not safety rules.

## When to Use

Use when a request could reasonably mean discovery, planning, implementation,
debugging, review, research or orchestration. Classify the request first and
select the narrowest posture that can complete it.

Do not use a mode label to broaden authorization. A review request remains
read-only; diagnosis does not authorize a fix; implementation does not imply
commit, push or deploy.

## Routing Procedure

1. Identify requested outcome: answer, decision, artifact, code change, root
   cause, review findings or coordinated execution.
2. Identify allowed mutations and separate local, Git, remote and production
   actions.
3. Choose one primary mode and state its completion evidence.
4. Add a secondary mode only when a blocking subproblem requires it; return to
   the primary mode after the bounded result.
5. Reclassify when user direction or discovered risk materially changes scope.

## Limitations and Stop Conditions

- Mode choice cannot resolve ambiguous product decisions or missing authority.
- “Orchestrate” is not permission to delegate or mutate every connected system.
- Stop when outcome and authorization imply conflicting modes.

## Example

```text
Request: "Why does the job fail?" -> debug/read-only, evidence is root cause.
Request: "Fix and verify it" -> implement, then proportional tests.
Request: "Deploy the fix" -> separate delivery authorization and runbook.
```

Routing is complete when the active posture, allowed actions, evidence and
transition/stop conditions are explicit.
