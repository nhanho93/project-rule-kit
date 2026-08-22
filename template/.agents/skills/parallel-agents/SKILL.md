---
name: parallel-agents
description: Use when dispatching or coordinating multiple agents with explicit ownership and merge boundaries.
---

# Parallel Agents

Parallelize only independent work whose file, decision and integration
boundaries are explicit. Dispatch is successful only when results can be merged
without guessing ownership or evidence provenance.

## When to Use

Use when at least two bounded tasks can run concurrently and each has a concrete
owner, inputs, outputs and non-overlapping write surface. Keep dependent work
serial even if more agents are available.

Do not parallelize product decisions, shared schema contracts, the same Git
index, overlapping files or tasks whose outputs determine another task's scope.
Use `multi-agent-monitor` after dispatch when live status monitoring is needed.

## Dispatch Workflow

1. Build a dependency graph and mark blocking edges before assigning workers.
2. Give each worker one outcome, exact read/write paths, prohibited paths,
   acceptance evidence, stop conditions and reporting destination.
3. Isolate overlapping Git work with worktrees; otherwise reserve disjoint file
   ownership. One coordinator owns integration and final continuity updates.
4. Require workers to preserve unrelated dirty work and report raw commands,
   diffs, findings and unresolved decisions instead of committing shared state.
5. Merge in dependency order. Re-run integration gates against the combined
   candidate; individual worker PASS does not prove merged PASS.
6. Close or interrupt idle workers and reconcile every report into one current
   status without copying stale claims.

## Limitations and Stop Conditions

- More workers can increase race, duplication and review cost.
- Stop dispatch when boundaries overlap, the dependency graph is cyclic, the
  coordinator cannot observe progress, or integration ownership is unclear.

## Example

```text
Safe: worker A audits API callers read-only; worker B audits browser cases read-only.
Unsafe: both edit the same policy file and stage into one shared index.
Merge gate: coordinator compares findings, applies one patch, then reruns combined tests.
```

Completion requires an ownership matrix, dependency graph, worker evidence,
merged verification and explicit disposition of every unresolved result.
