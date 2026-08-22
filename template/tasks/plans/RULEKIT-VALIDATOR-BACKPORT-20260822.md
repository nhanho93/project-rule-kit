# TASK CLASSIFICATION

TASK_CLASSIFICATION: complex
SIGNALS: multi_file,shared_contract,architecture_change

# GOAL

Backport validator hardening discovered during installation into a large
application repository without embedding project-specific names, paths,
owners, or registry formats.

# NON GOALS

- No application, database, runtime, deployment, or production changes.
- No Git commit, push, tag, release, or history rewrite.
- No identifiers from the originating application in reusable kit contracts.
- No weakening of template-authoring validation or installed-project gates.

# DISCOVERY EVIDENCE

- `scripts/check-project-customization.mjs` supports template and installed
  modes, but installed mode currently scans the full repository.
- `scripts/check-agent-links.mjs` scans the entire project and interprets
  fenced examples and template placeholders as live links.
- Registry and compliance fixtures copy the whole project, coupling validation
  cost and behavior to unrelated application files.
- `scripts/check-project-knowledge-loop.mjs` runs authoring mutation fixtures
  against installed projects whose canonical profile is already `VERIFIED`.
- `scripts/check-skill-catalog.mjs` lacks a portable metadata-controlled
  exception for justified project-overlay entrypoints.
- Existing projects can carry a legacy registry alongside the portable JSON
  registry, but the kit has no explicit extension/composition contract.
- Initial source-maintenance preflight exposed an authoring bootstrap defect:
  it always invoked installed customization. The explicit
  `--template-authoring` mode now validates template state and cannot bypass an
  installed-project gate.

# IMPLEMENTATION STEPS

1. Add and verify explicit template-authoring preflight support.
2. Scope installed customization and link validation to canonical agent/rule
   surfaces while retaining strict template validation.
3. Make registry, knowledge-loop, and compliance fixtures construct minimal
   deterministic workspaces.
4. Add portable registry-extension composition and metadata-governed large
   skill entrypoint exceptions.
5. Update installation and maintenance documentation.
6. Run source-template, installed-fixture, registry, catalog, link, knowledge,
   compliance, syntax, and diff gates.
7. Reconcile the handover, active checklist, and pending continuity files.

# DELIVERY SLICES

Execution uses four bounded tracer slices. Each slice has an independently
observable CLI result and keeps the existing default behavior compatible until
its replacement contract is verified.

SLICE A: Establish an explicit and guarded template-authoring preflight mode.

Outcome: source maintainers can establish a governed task receipt while the
template knowledge files intentionally remain unresolved.

Completion criterion: `agent-preflight --template-authoring` passes template
customization and creates a planning receipt; installed mode remains unchanged.

QC decision: browser E2E is not required because this is CLI governance logic.

SLICE B: Make installed validators and their fixtures deterministic and scoped.

Outcome: installed validation inspects only governed surfaces and fixtures no
longer clone unrelated application repositories.

Completion criterion: all focused validator fixtures pass in both template and
synthetic installed-project modes, including negative cases.

QC decision: browser E2E is not required; behavior fixtures are mandatory.

SLICE C: Add portable registry extension and large-entrypoint policies.

Outcome: projects can declare additional registry validators and justified
large skill entrypoints without project-name checks or silent bypasses.

Completion criterion: registry/catalog positive and negative fixtures enforce
metadata schema, path existence, reason, and owner requirements.

QC decision: browser E2E is not required; JSON and CLI fixtures are mandatory.

SLICE D: Update portable guidance, run the full gate matrix, and close continuity.

Outcome: installation and authoring guidance describe the new modes and phase
continuity records the verified result.

Completion criterion: full gate matrix passes and continuity hashes change.

QC decision: browser E2E is not required because no UI exists.

# DEPENDENCY EDGES

A <- NONE
B <- A
C <- B
D <- B, C

# ACCEPTANCE CRITERIA

- Template customization remains strict and passes in source authoring mode.
- Installed customization does not scan application/build/history files.
- A canonical knowledge document containing an explicit unresolved marker
  still fails installed validation.
- Link validation ignores fenced examples and placeholder paths but detects a
  real broken link in governed surfaces.
- Fixture suites use bounded source trees and prove the production template is
  unchanged.
- Installed knowledge-loop runs smoke validation without authoring mutations.
- Registry extensions are optional, path-validated, and cannot silently skip a
  failing validator.
- Large-entrypoint exceptions require explicit portable metadata, reason, and
  follow-up owner; undeclared oversized skills still fail.
- No reusable file contains identifiers from the originating application.

# VERIFICATION

- `node scripts/check-project-customization.mjs --template`
- Synthetic installed copy: `node scripts/check-project-customization.mjs --installed`
- `node scripts/check-agent-config-registry.mjs`
- `node scripts/check-skill-catalog.mjs`
- `node scripts/check-agent-links.mjs`
- `node scripts/check-skill-registry-fixtures.mjs`
- `node scripts/check-project-knowledge-loop.mjs`
- `node scripts/check-agent-compliance.mjs`
- `node --check` for every modified JavaScript module
- `git diff --check`
- A project-specific trace scan across the template must return zero matches.

# QC DECISION

Browser and E2E QC are not required. The changed surfaces are Node.js CLI
validators and Markdown/JSON contracts with deterministic behavior fixtures.

# ROLLBACK

Before any Git delivery, rollback is the exact changed-file patch only. Do not
use destructive repository-wide reset or clean operations. If an extension
contract breaks existing validation, retain the current JSON registry path as
the default and remove only the optional extension layer.

# APPROVAL

APPROVAL_STATUS: APPROVED

The operator explicitly approved execution on 2026-08-22 after reviewing the
backport inventory.
