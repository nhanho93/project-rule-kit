# Plan Artifact Contract

The plan is an evidence-backed execution contract, not a retrospective summary.
Use these exact Markdown headings so `agent-plan-gate` can validate it:

```text
# TASK CLASSIFICATION
TASK_CLASSIFICATION: complex|critical
SIGNALS: comma,separated,receipt,signals
# GOAL
# NON GOALS
# DISCOVERY EVIDENCE
# IMPLEMENTATION STEPS
# DELIVERY SLICES
# DEPENDENCY EDGES
# ACCEPTANCE CRITERIA
# VERIFICATION
# QC DECISION
# ROLLBACK
# APPROVAL
APPROVAL_STATUS: APPROVED|NOT_REQUIRED
```

Critical plans additionally require:

```text
# AUTHORIZATION BOUNDARY
# FAILURE RECOVERY
```

## Content Rules

- `DISCOVERY EVIDENCE`: verified paths, contracts, schemas, commands, runtime or
  DB facts; distinguish evidence from assumptions.
- `IMPLEMENTATION STEPS`: bounded order, dependencies, owners, and checkpoints.
- `DELIVERY SLICES`: each slice has an ID, independently demonstrable outcome,
  required layers, completion criterion, QC decision, and evidence artifact.
  A slice must fit one fresh execution context. Do not create separate DB/API/UI
  slices when none can be verified without the others.
- `DEPENDENCY EDGES`: list `SLICE_ID <- BLOCKER_ID` edges or explicitly state
  that a slice is unblocked. Every dependency must be necessary; cycles fail
  the plan. Wide mechanical changes use expand, bounded migration batches, and
  contract slices while preserving compatibility.

Example:

```text
WAVE_A <- NONE
WAVE_B <- WAVE_A
WAVE_C <- WAVE_A, WAVE_B
```
- For push-triggered build/deploy projects, each delivery slice is one coherent
  reversible commit and the dependency edge includes successful pipeline poll,
  deployed-version verification, health check, and smoke evidence. A later
  slice cannot start while the prior release is failed or indeterminate.
- `ACCEPTANCE CRITERIA`: observable outcomes and important negative cases.
- `VERIFICATION`: exact static, unit, integration, migration, security, and
  runtime gates proportional to risk.
- `QC DECISION`: explicitly state whether browser/E2E QC is required and why.
  If required, it cannot be skipped; include surfaces, roles, data, teardown,
  evidence, console, and network checks.
- `ROLLBACK`: recovery trigger and method. Do not claim rollback when none is
  feasible; classify the risk critical and record failure recovery.
- `APPROVAL`: complex may use `NOT_REQUIRED` only when no user choice or
  elevated mutation needs approval. Critical always requires `APPROVED`.
- No `TODO`, `TBD`, `FIXME`, or `REVIEW_REQUIRED` placeholders may remain.

If the plan changes after gating, rerun with `--refresh`. Phase close rejects a
missing or drifted plan hash.
