# Model Routing

## Model Selection and Budgeting

Before starting every new Antigravity task or subagent, ask the user which model they want to use. When possible, obtain the available models from the active account so the user can choose an exact identifier. Do not rely on a screenshot, a prior session, or a hard-coded model list when the CLI can provide the live list:

```powershell
$availableModels = & $antigravityExe models
$availableModels
```

Present the live model list to the user and ask for one explicit choice before starting:

- Model: the exact model identifier to use for the task.

Verify the exact identifier is in `$availableModels` when a live list is available. If the user already named a model, still verify it when possible. Do not start the agent without a user-selected model.

Use the selected model identifier exactly with `--model`. Record the selected model in the task brief and handoff.

Define a user-approved fallback ladder before execution when more than one model may be used. Never downgrade or switch pools silently.

### Four-model operating strategy

Use model strengths by phase. The default optimized pipeline is **reason and lock -> implement -> QC -> independent challenge**.

| Work type | Default model | Alternative / escalation | Operating rule |
|---|---|---|---|
| Plan/spec review, missing or conflicting rules | `gemini-3.1-pro-high` | `claude-opus-4-6-thinking` | Build the issue tree, invariants, and bidirectional traceability before edits. |
| Architecture, DB, transaction, cross-DB, RBAC, security | `gemini-3.1-pro-high` | `claude-opus-4-6-thinking` | Escalate to Opus when ambiguity, blast radius, or adversarial reasoning is unusually high. |
| Reverse review: report -> logic -> input -> report | `gemini-3.1-pro-high` | `claude-opus-4-6-thinking` | Require predicate inventory and source-to-output reconciliation. |
| Hard RCA: concurrency, retry, race, hidden state | `claude-opus-4-6-thinking` | `gemini-3.1-pro-high` | Use Opus when causal chains cross modules or earlier reviews disagree. |
| Complex multi-file implementation from a locked plan | `claude-sonnet-4-6` | `gemini-3.6-flash-high` | Prefer Sonnet when code quality, adjacent callers, or non-trivial refactoring matter. |
| Bounded implementation with explicit files and acceptance criteria | `gemini-3.6-flash-high` | `claude-sonnet-4-6` | Flash must receive the hardened execution contract from section 2. |
| Small fix, mechanical refactor, test additions | `gemini-3.6-flash-high` or `gemini-3.6-flash-medium` | `claude-sonnet-4-6` | Escalate only when the supposedly mechanical change exposes rule ambiguity. |
| Commands, migration checks, lint, deterministic verification | `gemini-3.6-flash-medium` | `gemini-3.6-flash-high` | Do not spend deep-reasoning quota on mechanical gates. |
| Browser MCP E2E and visual traversal | `gemini-3.6-flash-medium` | `gemini-3.6-flash-high`, then `claude-sonnet-4-6` | Case matrix must already be locked; use Sonnet only for ambiguous failure diagnosis. |
| Handover, todo, evidence synthesis | `gemini-3.6-flash-medium` | `gemini-3.6-flash-high` | Inputs and required sections must be explicit. |
| Independent final review before PROD | `claude-opus-4-6-thinking` | `gemini-3.1-pro-high` | Reviewer must challenge the locked plan and executor diff independently. |

### Model roles

- **Gemini 3.1 Pro High — logic owner:** use to discover, reason, design, and lock rules before implementation.
- **Claude Opus 4.6 Thinking — adversarial authority:** reserve for the hardest RCA, high-risk security/data decisions, disagreements between reviews, and final pre-PROD challenge. Do not spend it on mechanical execution or routine traversal.
- **Claude Sonnet 4.6 Thinking — quality executor/reviewer:** use for complex implementation, substantial refactors, and focused code review where Flash may miss adjacent behavior but Opus is unnecessary.
- **Gemini 3.6 Flash High — fast bounded executor:** use after the plan and invariants are locked; require exact scope, callers, edge cases, and gates.
- **Gemini 3.6 Flash Medium — tool/QC operator:** use for commands, structured evidence, Browser MCP traversal, and deterministic checks with a prepared case matrix.

### Recommended phase pipelines

- **High-risk feature:** `gemini-3.1-pro-high` locks logic -> `claude-sonnet-4-6` implements -> `gemini-3.6-flash-medium` runs QC -> `claude-opus-4-6-thinking` performs final challenge.
- **Normal bounded feature:** `gemini-3.1-pro-high` reviews plan -> `gemini-3.6-flash-high` implements -> `gemini-3.6-flash-medium` verifies -> `claude-sonnet-4-6` reviews only if risk or failures justify it.
- **QC-only wave:** `gemini-3.6-flash-medium` executes the locked matrix -> `claude-sonnet-4-6` handles ambiguous RCA -> return to the same QC model for re-test.
- **Critical review only:** use `claude-opus-4-6-thinking` as an independent challenger when Gemini Pro authored the plan; reverse them when Opus authored it to reduce correlated blind spots.

Model selection is not a claim that one provider always dominates another. Choose by task shape, live quota, and the need for reviewer independence. Preserve the user-approved fallback ladder and record every model transition in the handoff/evidence.

If `agy models` fails because authentication is required, report that condition and wait for the user to authenticate. If it fails due to service availability, report the raw category and ask the user for the model identifier they want to use manually.
