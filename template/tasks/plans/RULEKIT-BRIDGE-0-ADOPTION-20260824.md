# Rule Kit BRIDGE-0 — Controlled Legacy Adoption

CURRENT EXECUTION POINTER: `COMPLETE`

# TASK CLASSIFICATION

TASK_CLASSIFICATION: complex
SIGNALS: multi_file,shared_contract,architecture_change

# GOAL

Make upgrades from manually copied Rule Kit installations safe and repeatable:
the target may declare project-owned files/prefixes, an operator may adopt the
remaining reviewed managed files without changing their bytes, and a subsequent
approval-bound upgrade updates only managed files. Prove the contract by
dogfooding version 1.2.0 on AutoTask-CV before creating a stable tag/release.

# NON GOALS

- Do not infer target ownership from filenames or content.
- Do not overwrite project-owned files during adoption, install, upgrade, or rollback.
- Do not treat adoption as installation of missing files or removal of files.
- Do not change AutoTask application, runtime, database, VM, or production.
- Do not create the stable tag/release until downstream installed validation passes.

# DISCOVERY EVIDENCE

- Package entrypoint: `scripts/rulekit-install.mjs`; plan logic:
  `scripts/lib/rulekit-install-core.mjs`; apply/rollback:
  `scripts/lib/rulekit-install-apply.mjs`.
- Current state path is `.agent-system/install-state.json`; no target-local
  ownership overlay or adoption mode exists.
- AutoTask preview against package 1.1.0 reports 187 unmanaged-existing
  collisions, 19 installs, 65 unchanged files, 11 preserved project files and
  no prior install state.
- Comparing target collisions with source commit `4ccf345` finds 17 unchanged
  old canonical files and 170 files changed by prior collision-safe integration.
- AutoTask has 54 reusable skill IDs plus seven project overlays. Its canonical
  project facts are VERIFIED and must retain their recorded hashes.
- Operator approved BRIDGE-0, AutoTask dogfood, a separate AutoTask commit and a
  stable Rule Kit version/tag/release only after all gates pass.

# IMPLEMENTATION STEPS

1. Add strict parsing for target `.agent-system/rulekit-install-overrides.json`
   with normalized relative `projectOwnedPaths` and `projectOwnedPrefixes`.
2. Bind override content and execution mode into the approval digest. Surface
   the effective override path/counts in preview output.
3. Add `--adopt-existing` preview/apply. It is permitted only when managed state
   is absent/empty; it records hashes of reviewed existing managed regular files,
   never copies/removes target files, and excludes project-owned/missing files.
4. After adoption, require a fresh ordinary preview/digest before upgrade.
5. Add positive, stale-digest, existing-state, path-validation, rollback and
   customized-file preservation fixtures.
6. Document the two-digest existing-project flow and bump package version to 1.2.0.
7. Commit/push the verified source change without a tag, dogfood it on AutoTask,
   then create/push `v1.2.0` and a stable release only after downstream PASS.

# DELIVERY SLICES

SLICE B0-OVERRIDE-AND-ADOPTION: implement target-owned overrides and adoption with
unit-level installer fixtures. Completion is source checks and negative fixtures PASS.

STATUS: PASS — target override, state-only adoption, two-digest CLI, 15/15
installer fixtures and source Standards x Spec validators passed on 2026-08-24.

SLICE B1-SOURCE-DELIVERY: commit and push the verified 1.2.0 source candidate without
tagging. Completion is exact remote SHA verification.

STATUS: PASS WITH DOGFOOD CORRECTION — initial candidate `2e4db7c` was pushed
and verified. AutoTask doctor exposed archived installer backups as false live
inputs to link/customization validators; the source correction excludes only
bounded `.agent-system/install-backups` and transient stage directories and is
covered by the fifth link failure-injection assertion.

SLICE B2-AUTOTASK-DOGFOOD: adopt and upgrade AutoTask using two fresh approval
digests, preserve overlay hashes, run all installed validators plus simple and
complex workflow fixtures, and commit only governance paths. Completion is a
clean scoped commit with no runtime/deploy mutation.

STATUS: PASS — AutoTask local commit `77d94147`; 54 base + seven project
overlays; zero generic/large/warning/error debt; installed doctor healthy 11/11;
simple and complex workflow scenarios PASS. AutoTask was not pushed or deployed.

SLICE B3-STABLE-RELEASE: create and push annotated tag `v1.2.0`, then publish stable
release notes. Completion is remote tag/release verification against the exact
Rule Kit candidate SHA.

STATUS: PASS — annotated tag `v1.2.0` peels to dogfooded candidate
`1515504c0429f08b555d51a6491af6f58240ad32`; GitHub stable release is published.

# DEPENDENCY EDGES

B0-OVERRIDE-AND-ADOPTION <- NONE
B1-SOURCE-DELIVERY <- B0-OVERRIDE-AND-ADOPTION
B2-AUTOTASK-DOGFOOD <- B1-SOURCE-DELIVERY
B3-STABLE-RELEASE <- B2-AUTOTASK-DOGFOOD

# ACCEPTANCE CRITERIA

- Override paths are explicit, normalized, target-local, digest-bound and never
  copied into unrelated projects.
- Adoption with absent state changes only `install-state.json`; every adopted
  target file hash is identical before/after.
- Project-owned customized bytes remain identical through adoption and upgrade,
  including failure injection and rollback.
- A stale digest, invalid/escaping path, non-file collision, or non-empty prior
  state fails closed.
- Ordinary upgrade after adoption has zero collisions and updates only managed files.
- AutoTask retains 54 reusable skills plus seven project overlays, reports zero
  generic scaffolds and zero quality warnings, and preserves all named overlays.
- Simple classification executes without a master plan; complex classification
  remains blocked until an approved plan and records QC/phase-close decisions.
- Rule Kit stable tag/release points to the source candidate proven by dogfood.

# VERIFICATION

1. Node syntax for all changed/root/template scripts.
2. Installer fixtures, including adoption/override failure injection.
3. Rule Kit catalog, contract, registry, links, selection, drift, knowledge,
   compliance and doctor gates.
4. AutoTask before/after SHA inventory for project-owned overlays and skills.
5. AutoTask installed doctor plus catalog/contract/registry/link/selection/drift,
   knowledge-loop and compliance validators.
6. Isolated temporary simple/complex workflow fixtures with receipt, plan gate,
   QC decision and phase-close assertions.
7. `git diff --check`, credential/provenance scan, exact staged path review and
   remote SHA/tag/release verification.

# QC DECISION

Browser E2E is NOT_REQUIRED. This changes local agent governance and installer
behavior only; no browser-consumed application surface changes. CLI behavior
fixtures and failure injection are mandatory and cannot be skipped.

# ROLLBACK

- Installer apply keeps bounded backups and atomically restores mutations/state
  on failure.
- Adoption rollback is deletion/restoration of only the generated state file;
  it never edits adopted target files.
- Source or AutoTask commits recover through additive revert commits; no reset,
  clean, checkout-overwrite or history rewrite.
- A failed dogfood blocks stable tag/release and preserves the candidate for diagnosis.

# APPROVAL

APPROVAL_STATUS: APPROVED

The operator explicitly approved BRIDGE-0, dogfood, a separate AutoTask commit,
and stable version/tag/release after PASS. This does not authorize AutoTask
runtime deployment, VM mutation, database mutation, or production action.
