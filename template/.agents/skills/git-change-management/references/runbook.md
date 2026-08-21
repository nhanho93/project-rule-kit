# Portable Git Runbook

## 1. Discover Without Mutation

- Resolve the repository root and inspect `status`, current branch, upstream,
  remotes, recent history, and worktrees.
- Detect detached HEAD, merge/rebase/cherry-pick state, branch divergence,
  submodules, generated files, and unrelated dirty or untracked content.
- Identify which changes existed before this task. Do not claim or revert them.

## 2. Establish The Delivery Boundary

- Map requested work to explicit files and the project verification commands.
- Confirm the destination branch and whether a new branch, commit, push, PR,
  merge, tag, or release is authorized.
- For concurrent agents, assign non-overlapping ownership. Avoid sharing the
  Git index; prefer isolated worktrees when writers overlap in time.

## 3. Verify Before Staging

- Review the working diff and run the project-required checks.
- Stop on failed gates, unexpected files, secret/PII exposure, generated
  artifacts, unresolved conflicts, or branch/remote ambiguity.
- Do not bypass hooks unless the operator explicitly authorizes the bypass and
  its reason is recorded.

## 4. Stage And Commit Safely

- Stage explicit paths. Reinspect the staged diff and staged file list.
- Ensure the commit contains one coherent verified wave and no unrelated user
  work. Use the project commit convention; do not invent one.
- After commit, verify the commit SHA, content, and remaining working tree.

## 5. Push Or Integrate

- Fetch or inspect remote state before push when it can change the decision.
- Re-run required checks if integration changed the commit content.
- Never force-push, rewrite published history, merge, delete a branch, or tag a
  release without explicit authorization for that action.
- After push, verify the expected branch contains the exact commit. Record CI or
  review status when available.

### Push-Triggered Delivery Gate

When the project's delivery profile says a push starts build or deployment:

1. Keep one coherent, verified, rollback-capable wave per commit.
2. Push that wave once.
3. Poll the build/deployment to a terminal state using the project-defined
   timeout and evidence source.
4. Verify the deployed commit/version, health checks, and affected smoke path.
5. Open the next wave only after PASS.

A failed or unknown terminal state blocks the next commit and push. Diagnose,
recover, or roll back the current wave first; do not hide an unresolved release
under another commit.

## 6. Recover Without Data Loss

- Stop first and preserve evidence. Prefer additive recovery: new commit,
  revert commit, stash with a clear owner, or isolated worktree.
- Do not use destructive reset, checkout-overwrite, clean, or reflog/history
  rewriting unless the user explicitly selects it after targets are resolved.

## Close Evidence

- Repository and branch; bounded paths; verification commands and results.
- Commit SHA and remote/upstream verification, or why no commit/push occurred.
- Remaining dirty files, conflicts, CI/review status, owner, and next action.
