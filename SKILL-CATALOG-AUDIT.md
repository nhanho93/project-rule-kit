# Skill Catalog Audit

Audit scope: all 58 canonical skill entrypoints present before this catalog
revision.

## Merge Decisions

Four overlapping entrypoints were consolidated into stronger canonical skills:

| Removed entrypoint | Canonical owner | Reason |
|---|---|---|
| `browser-e2e-qc` | `e2e-qc` | Same browser journey and evidence boundary |
| `deployment-procedures` | `deployment-runbook` | Same trigger; runbook has the enforceable workflow |
| `plan-writing` | `planning-workflow` | Same implementation-planning branch |
| `ui-visual-qc` | `frontend-ui-qc` | Visual inspection is a rendered-UI QC mode |

Active canonical count after consolidation: 54.

## Deepened Skills

- `code-review-checklist`: independent Standards and Spec passes.
- `planning-workflow` and `plan-master`: tracer slices, dependency edges, and
  expand/migrate/contract handling.
- `architecture`: domain language, contract surface, locality, and module-depth
  review.
- `project-knowledge-update`: domain glossary ownership.
- `e2e-qc` and `frontend-ui-qc`: merged browser and visual evidence contracts.
- `deployment-runbook`: one verified commit per push-triggered delivery wave,
  terminal pipeline polling, and no next wave before PASS.

## Progressive Disclosure

- `antigravity-orchestrator` routes CLI runtime, model routing, and browser QC
  details through conditional references.
- `project-delivery-pipeline` routes optional skills and phase-close/learning mechanics
  through conditional references.
- Review and architecture details are loaded only for their matching branches.

## Ongoing Gate

`node scripts/check-skill-catalog.mjs` inventories canonical directories,
frontmatter, exact duplicate descriptions, thin/generic candidates, and large
entrypoints. `check-agent-config-registry.mjs` enforces invocation metadata and
rejects duplicate model-discoverable trigger branches.

Warnings are review prompts, not automatic deletion decisions. A concise
specialist skill may be valid; it must still have a distinct trigger and change
agent behavior.
