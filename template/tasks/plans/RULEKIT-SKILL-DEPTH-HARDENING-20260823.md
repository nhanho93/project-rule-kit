# RULEKIT-SKILL-DEPTH-HARDENING

CURRENT EXECUTION POINTER: `COMPLETE — WAVE 2 REQUIRES A NEW GATED SLICE`

# TASK CLASSIFICATION

TASK_CLASSIFICATION: complex
SIGNALS: multi_file,shared_contract,architecture_change

# GOAL

Close the already verified Rule Kit lifecycle-hardening work as one bounded
commit, then deepen the first eight high-impact agent-control skills so agents
select the right workflow, investigate beyond the literal request, and cannot
close on shallow review evidence. Wave 1 must remove exactly 23 reviewed warning
codes without weakening the frozen quality baseline.

# NON GOALS

- Do not import or rewrite the remaining catalog in bulk.
- Do not change application runtime, production systems, databases or secrets.
- Do not push, publish, tag or release without separate authorization.
- Do not regenerate the complete warning baseline to make warnings disappear.
- Do not claim that any model or agent inherently writes weak code; address the
  execution-literal risk through explicit discovery and verification contracts.

# DISCOVERY EVIDENCE

- `template/.agent-system/registry/skill-quality-warning-baseline.json` freezes
  143 warning codes across the catalog.
- The 34 generic scaffold skills account for 99 warnings; 44 warnings remain on
  non-generic skills and require later waves.
- Wave 1 owns: `intelligent-routing` (2 warnings), plus `brainstorming`,
  `code-organization-audit`, `lint-and-validate`, `testing-patterns`, `e2e-qc`,
  `parallel-agents`, and `multi-agent-monitor` (3 warnings each): 23 total.
- `template/.agent-system/policies/skill-authoring-standard.md` prohibits a
  baseline update before review and requires discriminating selection metadata,
  checkable completion criteria, conditional references and pruning.
- Current branch is `main`; `origin/main` and local HEAD are `4ccf345`. The
  existing dirty tree is the completed validator/lifecycle work recorded in
  the continuity records, evidence and the prior plans.
- The repository has no runtime deployment profile; Git commit is authorized by
  the operator, while push/publish remain outside this authorization.

# IMPLEMENTATION STEPS

1. `SLICE-0-CURRENT-STATE-CLOSE`: audit all current paths, run the full Rule Kit
   validation matrix, secret/trace scan, stage exact files and commit only the
   already completed lifecycle/validator state. Record SHA and remaining tree.
2. `W1-DISCOVERY-CONTRACT`: inspect all eight skill entrypoints, references,
   registry triggers, capability maps and fixtures. Produce a per-skill decision
   table: distinct trigger, anti-trigger, root-cause questions, related-path
   discovery, limitations, stop conditions, example and completion proof.
3. `W1-IMPLEMENT`: revise canonical skill bodies and only the references needed
   for progressive disclosure. Avoid copied boilerplate and overlapping trigger
   ownership. Add or strengthen behavior fixtures when text alone cannot prove
   selection or completion behavior.
4. `W1-REVIEW-CLOSE`: perform independent Standards x Spec review, run the full
   matrix, remove only the 23 resolved warning codes from the baseline, reconcile
   all three continuity records and write a bounded evidence report.

# DELIVERY SLICES

SLICE SLICE-0-CURRENT-STATE-CLOSE: Commit the verified lifecycle and validator state without Wave 1 edits.
SLICE W1-DISCOVERY-CONTRACT: Lock distinct behavior and proof contracts for all eight skills.
SLICE W1-IMPLEMENT: Implement the reviewed eight-skill depth contracts and focused fixtures.
SLICE W1-REVIEW-CLOSE: Independently review, validate, reduce the baseline and reconcile continuity.

## SLICE-0-CURRENT-STATE-CLOSE

Outcome: the pre-existing verified Rule Kit lifecycle/validator work is one
auditable commit with no Wave 1 skill-depth edits mixed into it.

Completion criterion: full current validation PASS, secret/trace scan PASS,
explicit staged-path audit PASS, commit SHA recorded, and remaining working tree
contains no unexplained pre-Slice-0 files.

QC decision: browser E2E is not required because this slice changes only the
portable installer, validators, policies, registry and documentation; CLI
failure-injection fixtures are the observable surface.

Evidence artifact: update `VALIDATION-EVIDENCE.md` only if the final commands or
counts differ from the existing lifecycle evidence; otherwise preserve it and
report the raw command matrix with the commit SHA.

Completion criterion: the per-skill discovery table has no unresolved trigger,
ownership, limitation, example or evidence branch and is reviewed before edits.

Completion criterion: all eight canonical entrypoints and necessary references
meet their locked contracts without trigger overlap or copied boilerplate.

## W1-REVIEW-CLOSE

Outcome: eight agent-control skills contain capability-specific selection,
deep-discovery, limitations, examples, stop conditions and completion evidence.

Required layers: canonical skill bodies, conditional references where needed,
registry/selection validation, catalog warning baseline, fixtures, continuity
SSOTs and QC evidence.

Completion criterion: catalog warnings fall from 143 to 120 and generic skills
from 34 to 26; the eight targets contribute zero remaining warning codes; no new
warning, trigger collision, semantic drift or risk downgrade appears.

QC decision: browser E2E is not required. The affected behavior is agent
selection and CLI/document instruction compliance, so deterministic selection,
negative-trigger, plan/compliance, link and catalog fixtures are required.

Evidence artifact:
`template/tasks/qc-evidence/RULEKIT-SKILL-DEPTH-HARDENING-WAVE-1-20260823.md`.

# DEPENDENCY EDGES

SLICE-0-CURRENT-STATE-CLOSE <- NONE
W1-DISCOVERY-CONTRACT <- SLICE-0-CURRENT-STATE-CLOSE
W1-IMPLEMENT <- W1-DISCOVERY-CONTRACT
W1-REVIEW-CLOSE <- W1-IMPLEMENT

# ACCEPTANCE CRITERIA

- Current lifecycle work exists in one exact-path commit; unrelated files are
  neither staged nor overwritten.
- Each Wave 1 skill answers when to use, when not to use, what to read, how to
  investigate root cause and related paths, how to execute, when to stop, and
  what evidence completes the task.
- Examples are capability-specific and include a negative or boundary case;
  copied generic sections do not count.
- Antigravity/Codex/Cursor routing remains cross-platform and no trigger branch
  overlaps another model-discoverable skill.
- Wave 1 warning delta is exactly `143 -> 120`; generic scaffold count is
  exactly `34 -> 26`. Any larger unexplained decrease blocks baseline update.
- Existing safety, offensive-skill, template-customization, installation,
  selection, semantic-drift and compliance fixtures remain green.
- All three continuity records identify completed work, remaining 26 generic
  skills, remaining 120 warnings, owner and next wave.

# VERIFICATION

Run from `D:/Project/Project-Rule-Kit`:

1. Node syntax check for every `template/scripts/**/*.mjs` and root `scripts`.
2. `node template/scripts/check-project-customization.mjs --template`.
3. `node template/scripts/check-agent-config-registry.mjs`.
4. `node template/scripts/check-agent-links.mjs`.
5. `node template/scripts/check-skill-catalog.mjs` before and after the reviewed
   baseline reduction.
6. Selection, semantic-drift, registry/catalog, link, knowledge-loop,
   compliance, stack and installer fixture commands referenced by
   `template/scripts/rulekit-doctor.mjs` and lifecycle evidence.
7. External branding/project-trace and secret-pattern scan over staged paths.
8. `git diff --check`, staged diff review, exact staged file list and post-commit
   SHA/content verification for Slice 0.

# QC DECISION

`E2E_DECISION: NOT_REQUIRED`. No web application route, browser-consumed API,
UI component, authorization surface or runtime data is changed. Required QC is
the complete CLI/fixture matrix plus negative selection and warning-regression
cases. If a browser-visible installer or catalog UI is added, this decision must
be upgraded and the plan refreshed.

# ROLLBACK

- Before commit: unstage only the exact Slice 0 paths and preserve working files.
- After commit: use an additive revert commit if the committed lifecycle state
  is found invalid; do not reset or rewrite history.
- During Wave 1: revert only the affected skill/baseline/fixture patches with a
  new commit after evidence; preserve the frozen pre-wave baseline for recovery.
- Stop without baseline mutation if warning counts, triggers or fixtures are
  inconsistent.

# APPROVAL

APPROVAL_STATUS: APPROVED

The operator explicitly authorized closing and committing the current working
tree, creating this master plan and executing Wave 1. Push, publish, release and
any second commit are not inferred from that authorization.
