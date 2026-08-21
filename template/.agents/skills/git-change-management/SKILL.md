---
name: git-change-management
description: Use for staging, committing, branching, merging, rebasing, pushing, pull requests, or recovering Git state; excludes read-only source inspection that does not alter Git state.
---

# Git Change Management

Deliver a bounded, verified repository change without overwriting user work or
mutating the wrong branch or remote.

Before any Git mutation, read:

1. `docs/agent-rules/delivery-profile.md`
2. `.agent-system/policies/delivery-safety.md`
3. [references/runbook.md](references/runbook.md)

Treat commit, push, merge, rebase, reset, tag, release, and branch deletion as
separate actions. Authorization for one does not imply authorization for the
others. Use project-native checks and conventions from the delivery profile.

At close, report the bounded file set, checks, branch, commit SHA when created,
remote verification when pushed, and every unresolved owner/next action.
If a phase-close manifest is used, include a sanitized `delivery` section with
`git` in `operations`, the branch/remote alias in `target`, explicit
`authorized: true`, and bounded action/result evidence.
