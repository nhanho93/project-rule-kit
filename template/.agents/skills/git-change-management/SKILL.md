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

## When to Use

Use before staging, commit, branch, merge, rebase, reset, tag, push, pull request,
or Git recovery. Read-only `status`, `diff`, and `log` inspection alone does not
require this skill.

## Limitations and Stop Conditions

- Commit permission does not imply push, merge, rebase, reset, tag, release, or
  branch-deletion permission.
- Do not stage unrelated user changes, rewrite shared history, bypass failing
  checks, or mutate an unexpected branch/remote without explicit authorization.
- Stop when repository identity, bounded file set, ownership of dirty changes,
  or recovery path is uncertain.

## Example

For one verified wave, inspect status/diff, stage only declared paths, review the
staged diff, run required checks, and create one commit. Report its SHA and leave
it local unless push was separately authorized; if authorized, verify the remote
SHA after push before starting the next deployment-triggering wave.
