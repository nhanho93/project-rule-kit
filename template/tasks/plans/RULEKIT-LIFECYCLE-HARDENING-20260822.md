# TASK CLASSIFICATION

TASK_CLASSIFICATION: complex

SIGNALS: multi_file,shared_contract,architecture_change

# GOAL

Add a safe, deterministic lifecycle for installing, selecting, validating and
auditing Project Rule Kit capabilities across supported agent platforms.

# NON GOALS

- Do not import the complete external skill catalog.
- Do not add a catalog UI, Workbench, npm distribution or public marketplace.
- Do not add an MCP skill-selection server.
- Do not introduce Claude-only or Codex-only assumptions.
- Do not copy external provenance metadata, code, prose or branding.
- Do not build a complex transaction-journal or recovery framework.
- Do not commit, push, publish, deploy or mutate an installed project.

# DISCOVERY EVIDENCE

- `install.md` currently copies `template/*` with `Copy-Item -Force` before the
  documented inspect step, so collision discovery is not a true pre-write gate.
- `.agent-system/registry/skills.json` is the canonical 54-skill registry and
  already owns `invocationMode` and exclusive `triggerBranches`.
- `check-skill-catalog.mjs` reports shallow skill entrypoints but does not have
  risk, maturity, depth, verification-profile or warning-budget contracts.
- The template already has project customization, task classification, plan,
  phase-close, knowledge and continuity gates; these remain canonical.
- The current working tree contains the completed validator-backport batch and
  must be preserved without unrelated formatting or history changes.

# IMPLEMENTATION STEPS

1. Add a source package manifest and a dependency-free installer with read-only
   planning, collision detection, approval digest, managed ownership, staging,
   bounded backup and rollback-on-error.
2. Add a desired-state stack manifest and validator binding kit version,
   supported platforms, registry digest, project-profile digest and exact skill
   IDs; provide an explicit refresh command for post-customization hashes.
3. Extend skill registry quality metadata and catalog checks for risk,
   maturity, depth, verification profile, examples, limitations and warning
   regressions.
4. Add a ten-dimension capability coverage contract and deterministic selection
   evidence builder/validator using relative paths and sanitized hashes only.
5. Add semantic skill-drift baseline/checking and a read-only doctor aggregator
   with stable reason codes.
6. Update install/README/registry documentation and phase continuity.

# DELIVERY SLICES

SLICE A-SAFE-INSTALLER: Preview-first installation without silent overwrite.

Installation and upgrade are preview-first and cannot silently
overwrite unmanaged or locally modified files. Required layers: root package
manifest, installer modules, fixtures and install docs. Completion: dry-run is
write-free; wrong/stale approval fails; fresh install passes; collision blocks;
managed update is idempotent; injected copy failure restores prior files.
QC: browser E2E NOT_REQUIRED because the command is isolated developer tooling
with no runtime or browser consumer.

SLICE B-DESIRED-STATE: Bind intended platforms and exact skills to project state.

An installed project can prove the intended platforms and exact skill
registry against current project knowledge. Required layers: JSON manifest,
digest utility, refresh/validate commands and fixtures. Completion: unchanged
state passes and profile/registry/skill drift fails with stable codes.
QC: browser E2E NOT_REQUIRED; filesystem/schema behavior is terminal-verifiable.

SLICE C-SKILL-QUALITY: Prevent catalog quality and safety debt regressions.

Shallow or unsafe skill changes cannot increase catalog quality debt.
Required layers: registry metadata, validator, warning baseline and fixtures.
Completion: all entries validate metadata, current debt is explicit, and every
new warning or risk downgrade fails.
QC: browser E2E NOT_REQUIRED; only authoring-time registry validation changes.

SLICE D-SELECTION-EVIDENCE: Record auditable ten-dimension capability coverage.

Every installed project records all ten capability dimensions as
covered, gap or not-applicable and binds selected skills to repository evidence.
Required layers: coverage manifest, builder/validator and documentation.
Completion: missing dimensions, unknown skills, absolute paths, stale hashes or
unbound selected skills fail; a valid fixture passes deterministically.
QC: browser E2E NOT_REQUIRED; output is a local machine-readable audit artifact.

SLICE E-DRIFT-DOCTOR: Detect semantic drift and aggregate read-only health.

Maintainers can detect semantic skill drift and run one read-only
health command. Required layers: normalized baseline, drift checker, doctor and
fixtures. Completion: metadata-only noise is ignored, body changes are found,
doctor aggregates stable results without mutation, and documentation is current.
QC: browser E2E NOT_REQUIRED; all consumers are repository maintenance scripts.

# DEPENDENCY EDGES

A-SAFE-INSTALLER <- NONE

B-DESIRED-STATE <- A-SAFE-INSTALLER

C-SKILL-QUALITY <- B-DESIRED-STATE

D-SELECTION-EVIDENCE <- B-DESIRED-STATE,C-SKILL-QUALITY

E-DRIFT-DOCTOR <- C-SKILL-QUALITY,D-SELECTION-EVIDENCE

# ACCEPTANCE CRITERIA

- No install or upgrade writes before a reviewed approval digest is supplied.
- Existing unmanaged and locally modified managed files are preserved and
  reported as collisions.
- Installer paths remain inside explicit source and target roots and reject
  symbolic-link traversal.
- Desired state is deterministic and detects version, registry, platform,
  profile and exact-skill drift.
- Every registry entry has valid quality metadata; warning debt cannot grow.
- Capability selection covers exactly ten required dimensions with auditable,
  relative evidence and no source contents or secrets.
- Drift and doctor commands are read-only and emit stable structured results.
- Existing customization, compliance, continuity, Git/VM and platform-adapter
  contracts continue to pass.

# VERIFICATION

- Run every new fixture suite, including collision, stale approval, symlink,
  idempotency, failure injection, digest drift and invalid evidence cases.
- Run `node scripts/check-project-customization.mjs` in template mode.
- Run registry, catalog, registry-fixture, link, link-fixture, knowledge-loop and
  compliance validators.
- Inspect `git diff --check`, full scoped diff and `git status --short`.
- Confirm no external repository names, package branding or copied source
  attribution appear in the added implementation.

# QC DECISION

Real-browser E2E QC is NOT_REQUIRED for all slices. The changed surfaces are
dependency-free installer and repository-authoring scripts; they are not loaded
by an application runtime, API, route, UI, authenticated flow or browser build.
Executable filesystem fixtures and failure injection are the applicable E2E
boundary for this task.

# ROLLBACK

Before commit, revert only files listed by this plan. Installer apply uses a
bounded per-run backup and restores promoted files on failure. Existing
unmanaged or modified files are never included in an automatic rollback set.

# APPROVAL

APPROVAL_STATUS: APPROVED

The operator explicitly approved implementation after reviewing the proposed
scope and exclusions on 2026-08-22. This approval excludes commit, push,
publication, deployment and mutation of downstream installed projects.
