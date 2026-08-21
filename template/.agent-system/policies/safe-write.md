# Safe Write

Core logic: protect user and agent work from accidental overwrite.

Benefit: preserves WIP, reduces merge loss, and makes edits reviewable.

Why/when apply: before creating, editing, deleting, moving, staging, or
generating files.

How to apply:

1. Read an existing file before editing it.
2. Confirm non-existence before creating a file at a new path.
3. Use small patches instead of broad overwrite.
4. Inspect `git diff` for touched files.
5. Inspect `git status` before phase close.
6. If untracked content disappears or unexpected content appears, stop and ask
   the user.

Never use destructive git commands unless the user explicitly asks.
