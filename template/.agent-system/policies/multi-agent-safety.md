# Multi-Agent Safety

Core logic: parallelism needs ownership.

Benefit: avoids race conditions, overlapping edits, and accidental staging.

Why/when apply: two or more agents or workers operate in one repo or on related
files.

How to apply:

1. Assign explicit file/path ownership.
2. Shared workspace work is read-only or non-overlapping.
3. Write-capable workers use isolated branches/worktrees when available.
4. Workers do not edit hot handover/todo surfaces directly during a wave.
5. Coordinator merges reports and performs final verification.
