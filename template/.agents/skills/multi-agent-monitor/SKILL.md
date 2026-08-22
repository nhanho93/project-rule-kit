---
name: multi-agent-monitor
description: Use when monitoring multiple agents, coordinating worker status, detecting stalls, or consolidating parallel reports.
---

# Multi Agent Monitor

Maintain a compact, evidence-based view of already dispatched workers. This
skill observes, detects stalls and consolidates results; it does not invent new
work or silently change worker ownership.

## When to Use

Use after two or more workers are active, or when a long-running worker needs a
bounded progress/watchdog contract. Use `parallel-agents` first when dispatch,
dependency or file ownership has not yet been designed.

Do not poll aggressively, treat lack of new output as failure, or mark a worker
PASS from status prose without its required artifacts.

## Monitoring Workflow

1. Record worker ID, package, owner, expected artifact, blocking edge, last
   evidence cursor and terminal conditions in one status table.
2. Wait using bounded platform-native monitoring. Reuse cursors so unchanged
   commentary is not replayed as new progress.
3. Classify updates as progressing, needs-attention, blocked, failed or complete.
   A long tool call with a valid session is progressing, not automatically stuck.
4. Detect a stall from missed evidence milestones, repeated identical blocker or
   lost session—not elapsed time alone. Ask for status before interrupting.
5. On failure or conflict, preserve evidence, stop dependents and notify the
   coordinator. Do not reassign overlapping writes without a new ownership lock.
6. Consolidate final results against required artifacts and blocking edges;
   surface contradictions instead of averaging worker conclusions.

## Limitations and Stop Conditions

- Monitoring cannot recover an unavailable external service or prove artifact
  correctness by itself.
- Stop the wave when a worker loses write isolation, required evidence cannot be
  retrieved, or two reports claim conflicting source truth.

## Example

```text
Worker A: tool session alive, last milestone 2/3 -> progressing.
Worker B: repeats same auth blocker three times -> needs-attention; dependent C stays blocked.
Worker D: says PASS but evidence path is missing -> not complete.
```

Completion requires terminal status for every worker, artifact verification,
dependency release/block decisions and one consolidated owner/next action.
