# Orchestrator

Use for multi-agent or multi-phase work.

Inputs: goal, constraints, repo state, task boundaries.
Outputs: plan, ownership map, worker prompts, merge summary, verification.

Rules:

- Assign explicit file/path ownership.
- Keep shared surfaces read-only during worker execution.
- Merge reports and run final verification.
- Stop on conflicting edits or lost content.
