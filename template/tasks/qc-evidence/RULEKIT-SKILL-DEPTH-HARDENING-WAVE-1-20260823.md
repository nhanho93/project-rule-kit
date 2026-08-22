# Rule Kit Skill Depth Hardening — Wave 1 Evidence

## Scope and Decision

- Deepened `intelligent-routing`, `brainstorming`, `code-organization-audit`,
  `lint-and-validate`, `testing-patterns`, `e2e-qc`, `parallel-agents` and
  `multi-agent-monitor`.
- Addressed execution-literal risk through explicit root-cause questions,
  related-path boundaries, negative/edge cases, stop conditions and completion
  proof. This is not a claim that Antigravity or another agent writes weak code.
- Browser E2E: `NOT_REQUIRED`; the changed surfaces are portable instruction and
  CLI validation contracts with no browser/runtime consumer.

## Standards x Spec Review

| Axis | Review | Result |
|---|---|---|
| Standards | Each entrypoint has discriminating selection text, when/not-to-use boundaries, workflow, limitations, worked example and completion criterion; all remain below 200 lines | PASS |
| Spec | Routing owns selection, brainstorming owns open decisions, organization audit does not refactor, lint does not substitute behavior tests, testing delegates browser execution to E2E, parallel dispatch is separate from monitoring | PASS |
| Discovery depth | Validator requires root-cause/baseline attribution, callers/consumers or dependency trace, failing characterization, edge matrix, evidence cursors and artifact proof as appropriate | PASS |
| Anti-regression | Failure injection removes routing ownership, monitoring evidence and rejected-behavior characterization; every mutation fails the validator | PASS 4/4 |
| Baseline safety | Preview showed exactly eight changed semantic hashes and exactly 23 removable warning codes before baseline refresh | PASS |

## Quality Delta

| Metric | Before | After | Delta |
|---|---:|---:|---:|
| Catalog skills | 54 | 54 | 0 |
| Quality warnings | 143 | 120 | -23 |
| Generic scaffolds | 34 | 26 | -8 |
| Thin entrypoints | 0 | 0 | 0 |
| Trigger collisions | 0 | 0 | 0 |

The baseline diff removes only the eight Wave 1 entries. Metadata and warning
entries for every other skill remain unchanged.

## Verification

- `node scripts/check-agent-control-skill-depth.mjs`: PASS, 8 skills, 0 errors.
- `node scripts/check-agent-control-skill-depth-fixtures.mjs`: PASS, 4/4.
- `node scripts/check-skill-catalog.mjs`: PASS, 54 skills, 120 warnings,
  26 generic scaffolds, 0 errors.
- Registry, links, desired state, selection evidence and semantic drift: PASS.
- Full doctor is healthy with 10/10 checks; installer 8/8, desired-state 4/4,
  link 4/4, registry/catalog 10/10, selection 5/5, semantic drift 3/3,
  agent-control depth 4/4, knowledge loop 16/16 and compliance 20 cases/119
  assertions all PASS. `git diff --check` also PASS.

## Residual Risk and Next Action

- 26 generic skills and 120 warnings remain; they are frozen against regression.
- Wave 1 is not committed or pushed. Owner: operator/maintainer. Next action:
  authorize a separate commit after reviewing this evidence, then decide push
  independently.

KNOWLEDGE_IMPACT: NO_CHANGE — reusable skill and validator artifacts changed,
but no installed-project fact or canonical project knowledge overlay changed.
