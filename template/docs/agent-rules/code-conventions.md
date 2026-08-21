---
last_verified: ''
evidence_sources: ''
impacted_modules: ''
decision_owner: ''
status: 'UNRESOLVED'
---

# Code Conventions

This file records stable conventions discovered while working in the project.

## Defaults

- Prefer existing project patterns over new abstractions.
- Keep changes scoped to the request.
- Split code by responsibility when a file becomes hard to reason about.
- Add tests proportional to risk and blast radius.
- Avoid unrelated formatting churn.

## Feedback Loop

After each implementation, review, or refactor, make a mandatory phase-close declaration:
`KNOWLEDGE_IMPACT CHANGED|NO_CHANGE|UNRESOLVED`

- CHANGED: verified update.
- NO_CHANGE: verified no reusable knowledge with reason.
- UNRESOLVED: conflict/insufficient evidence and owner/next action.

Only add conventions that help future tasks. Do not write one-off notes here. Stable knowledge only; avoid documentation churn.
