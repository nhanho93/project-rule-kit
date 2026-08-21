---
name: antigravity-orchestrator
description: Coordinate Antigravity CLI, IDE, or 2.0 agents for scoped engineering, implementation, review, and E2E QC. Use when Codex must route work across Gemini Pro/Flash and Claude Opus/Sonnet, select a host-aware browser surface, install the bundled Browser MCP X fallback when native browser tools are unavailable, review trajectory evidence, and accept work only after independent gates pass.
---

# Antigravity Orchestrator

Use Codex as orchestrator and quality gate. Use the default Antigravity agent as executor unless the user explicitly selects a specialist. The user owns product decisions, scope changes, approval, and account changes.

## 1. Preflight Once Per Task

Before planning or launching a new Antigravity task:

1. Resolve and verify the CLI binary.
2. Run `agy models` and verify the exact selected model identifier.
3. Run `agy -p "/usage"` exactly once. This read-only print-mode command does not create a conversation or spend model quota in CLI 1.1.11+.
4. Allocate work according to the live five-hour and weekly pools. Reserve the strongest available model for rule/logic/DB review and use a cheaper approved model for bounded QC or mechanical execution.
5. Record the selected model, fallback ladder, and quota snapshot in the brief. Do not recheck usage during normal execution; recheck only under the error rules in section 7.

Do not infer quota from a previous session or another account.

## 2. Frame and Decompose the Task

Before delegating, write a compact brief with:

- Goal and exact expected output.
- In-scope and explicitly out-of-scope work.
- Repository, files, folders, and source material to inspect.
- Constraints: branch, permissions, data environment, style, and time box.
- Acceptance criteria and required proof: tests, rendered file, screenshots, diff, or logs.
- Escalation points that require the user's decision.

Do not delegate an ambiguous broad goal. Ask the user only for a decision that cannot be safely inferred.

### Mandatory hardening for Gemini models

Treat every Gemini Flash or Pro task as requiring an explicit execution contract. These models can produce shallow changes that miss adjacent rules, callers, persistence paths, and edge cases when given a broad brief.

- Split broad work into bounded phases: discovery -> rule/data-flow map -> implementation -> adversarial review -> verification.
- For complex code, use a plan/review pass before the edit pass. Do not ask Gemini to discover, redesign, implement, and certify a multi-module change in one vague prompt.
- Name the exact entry points, related services, schemas/migrations, jobs, notification paths, UI consumers, tests, plans/specs, and repository rules to inspect.
- Require bidirectional traceability: output/report -> business rule -> query/service -> DB/input source, then input source -> mutations -> projections -> output/report.
- Require a caller/callee and read/write inventory using repository search. A named file list is a starting point, not permission to ignore related code found by search.
- State invariants, authorization boundaries, transaction and cross-DB behavior, idempotency, soft delete, null/empty/duplicate/concurrency/timezone/retry cases, and failure recovery where relevant.
- Require evidence for every acceptance criterion: exact tests, sanitized queries, screenshots, diffs, and unresolved risks. Never accept “tests pass” without command output or artifacts.
- After Gemini returns, Codex independently reviews the diff and runs proportional gates. If logic remains incomplete, send a narrow revision brief with observed evidence and exact expected behavior.

Use smaller prompts and checkpoints rather than compensating with `--effort`.

## 3. Conditional Operating References

Read only the branch needed for the active task:

- CLI discovery/install, execution mode, permissions, retries, account or runtime errors: [references/cli-runtime.md](references/cli-runtime.md).
- Model selection, quota allocation, and fallback strategy: [references/model-routing.md](references/model-routing.md).
- E2E skill installation, native-browser/MCP fallback, and evidence acceptance: [references/browser-qc.md](references/browser-qc.md).

Completion: the chosen branch reference was read, its preflight passed, and the selected command/surface plus fallback was recorded.

## 4. Account Boundaries

Never auto-switch accounts, request credentials, copy browser sessions, bypass quotas, or use another person's account. An account switch is a user-confirmed action. After the user switches, verify that the CLI works before resuming.

## 5. Review and Revision Loop

Review Antigravity output against the original acceptance criteria, not its own summary. Check scope, correctness, regressions, tests, layout or screenshots, output readability, and absence of secrets or unrelated diffs.

When work is incomplete, send one focused revision brief containing: observed evidence, expected behavior, affected files or output, and the exact verification needed. Repeat until the criteria pass or a user decision is required.

## 6. Finalize

Deliver the final artifact or a concise review to the user. State what changed, evidence of validation, open risks, and the exact files or links. Update the repository handover only when the project workflow requires it.

## Brief Template

```text
Goal:
Output:
Scope:
Do not change:
Read first:
Acceptance criteria:
Run and report:
Escalate before:
Selected model:
Fallback ladder:
Quota snapshot: <weekly and five-hour pools, checked once before task>
Selected agent: default (omit --agent) unless explicitly selected
Execution strategy: <-i interactive | -p one-shot; explain why>
Mode: <plan | accept-edits>; --effort omitted
Approved workspace folders:
Permission flag enabled:
```
