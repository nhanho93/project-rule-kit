# Session And Phase Close

Core logic: preserve continuity between agent sessions.

Benefit: future agents can resume without rereading the whole project.

Why/when apply: multi-step work, phase close, blocked work, or handoff.

How to apply:

1. Keep visible progress while working.
2. At close, summarize completed work, verification, open risks, and next steps.
3. Run the exact supported phase-close command: `node scripts/agent-phase-close.mjs --task-id <id> --manifest <path>`
   - Continuity is enabled by default. Update head `handover*.md` and `todo*.md` before running, and reconcile the single `pending_todo.md`. Never suffix `pending_todo.md`.
   - The manifest dictates the status (CHANGED, NO_CHANGE, UNRESOLVED) and continuity actions.
4. Understand the script exit codes:
   - `Exit 0`: Success. The phase is closed compliantly.
   - `Exit 1`: Invalid gate. The manifest or evidence is invalid; you must fix it and retry.
   - `Exit 2`: Compliant unresolved/blocker. The task is closed, but work is unresolved.
5. Record only stable knowledge; do not cause documentation churn.
6. Do not create duplicate dashboards unless requested.
