# Validation Evidence

Date: 2026-08-04

Scope: created reusable cross-platform project rule kit at
`D:\Project\Project-Rule-Kit`.

Initial inventory:

- Files: 99
- Registry items: 35
- Canonical skills: 13
- Canonical agents: 12
- Markdown files checked: 90

Expanded inventory after full original catalog port:

- Files: 210
- Registry items: 90
- Canonical skills: 54
- Canonical agents: 26
- Cursor skill adapters: 54
- Cursor agent adapters: 26
- Markdown files checked: 200

Checks:

- `node scripts/check-agent-config-registry.mjs`: PASS, 35 items, 0 errors.
- `node scripts/check-agent-links.mjs`: PASS, 90 Markdown files, 0 broken links.
- `node --check scripts/check-agent-config-registry.mjs`: PASS.
- `node --check scripts/check-agent-links.mjs`: PASS.

Expanded catalog checks:

- `node scripts/check-agent-config-registry.mjs`: PASS, 90 items, 0 errors.
- `node scripts/check-agent-links.mjs`: PASS, 200 Markdown files, 0 broken links.
- `node --check scripts/check-agent-config-registry.mjs`: PASS.
- `node --check scripts/check-agent-links.mjs`: PASS.

Design notes:

- Source-project-specific rules were generalized before inclusion.
- Domain-specific rules are represented as portable `core logic`, `benefit`,
  `why/when apply`, and `how to apply` guidance.
- Canonical shared bodies live in `.agent-system` and `.agents`.
- Cursor uses thin native adapters.
- Codex uses `AGENTS.md` and `.agent-system/registry/codex-skill-map.md`.
- Antigravity uses `GEMINI.md`, `AGENTS.md`, and `.agents/skills`.
- The source catalog was converted into on-demand portable entries. Capability
  names and bodies are project-neutral and retain only reusable logic, benefit,
  trigger conditions, and application guidance.

## Browser QC and Antigravity package sync

Date: 2026-08-12

Scope:

- Added canonical `antigravity-orchestrator` and `project-delivery-pipeline` packages.
- Added thin Cursor adapters and Codex registry routes for both skills.
- Bundled Browser MCP X QC portable version `1.0.2` in both canonical packages,
  with SHA256
  `F046C340B0B078E321CA5927EF2F1BFC5B9E8DDD52FCF7E3C33BF8C5F0CDE0F1`.
- Synced the four-model routing strategy, quota/error fallback rules,
  interactive versus print execution guidance, and host-aware native browser
  to Browser MCP to headed Playwright QC ladder.
- Updated the portable `e2e-qc` skill with browser preflight and evidence
  acceptance gates.

Current inventory:

- Files: 219
- Registry items: 92
- Canonical skills: 56
- Canonical agents: 26
- Cursor skill adapters: 56
- Cursor agent adapters: 26
- Markdown files checked: 204

Checks:

- `node scripts/check-agent-config-registry.mjs`: PASS, 92 items, 0 errors.
- `node scripts/check-agent-links.mjs`: PASS, 204 Markdown files, 0 broken links.
- Skill quick validation: PASS for `antigravity-orchestrator`,
  `project-delivery-pipeline`, and `e2e-qc`.
- PowerShell parser: PASS, 0 errors for both packaged
  `ensure-browser-mcp-x.ps1` scripts.
- Source-to-kit SHA256 comparison: PASS for both skill bodies, installers,
  archives, checksum sidecars, and version sidecars.
- Installed-state preflight (`-Agent All`, no install): PASS; Browser MCP X QC
  version `1.0.2`, runtime/config/version all ready.

## Project Knowledge Loop & Structure Updates

Date: 2026-08-21

Scope:
- Added `project-knowledge-loop` canonical policy, Cursor and Antigravity adapters, and registry entry.
- Optimized context routing by task shape to prevent context bloat.
- Upgraded `code-conventions.md`, `project-structure.md` and added `markdown-conventions.md`.
- Added `bootstrap-project-context.mjs` and `check-project-customization.mjs`.

Checks:
- `node scripts/check-agent-config-registry.mjs`: PASS
- `node scripts/check-agent-links.mjs`: PASS
- `node scripts/check-project-customization.mjs --template` in `template/`: PASS
- Fixture matrix: `node scripts/bootstrap-project-context.mjs --apply` correctly replaces known project facts, preserves untouched placeholders as `REVIEW_REQUIRED`, and `node scripts/check-project-customization.mjs --installed` fails due to `REVIEW_REQUIRED` (ensuring manual verification). Idempotency preserved.



### check-agent-config-registry.mjs
```text
[START] check-agent-config-registry
items=93
errors=0
[END] check-agent-config-registry PASS
```

### check-agent-links.mjs
```text
[START] check-agent-links
markdown=212
broken=0
[END] check-agent-links PASS
```

### check-project-customization.mjs --template
```text
[START] check-project-customization (Mode: Template)
[END] check-project-customization PASS.
```

### check-project-knowledge-loop.mjs
```text
[FIXTURE] Started in %TEMP%\project-rule-kit-fixture-<run-id>
[FIXTURE] 1. Checking template passes...
[FIXTURE] 2. Checking installed copy fails before customization...
[FIXTURE] 3. Checking inspect mode produces identical hashes...
[FIXTURE] 4. Checking --apply leaves REVIEW_REQUIRED...
[FIXTURE] 5. Simulating HUMAN REVIEW on 4 canonical files...
[FIXTURE] 6. Checking installed validation passes after human review...
[FIXTURE] 6.5 Checking negative fixtures for frontmatter...
[FIXTURE] 7. Checking second --apply preserves custom content...
[FIXTURE] 8. Checking unauthorized placeholder injections...
[FIXTURE] 9. Checking malformed and conflicting package manager...
[FIXTURE] ALL TESTS PASSED! (15 assertions)
[FIXTURE] Cleaning up %TEMP%\project-rule-kit-fixture-<run-id>
```

## Agent Compliance Enforcement

Date: 2026-08-21

Scope:
- Added task-scoped, atomic, ignored receipts with strict schema, root, generation, context-hash, continuity, close-result, and history validation.
- Required a sanitized phase-close manifest with exact `CHANGED`, `NO_CHANGE`, or `UNRESOLVED` knowledge impact semantics.
- Enabled continuity by default and enforced monotonic handover/todo advancement plus actual `pending_todo.md` hash reconciliation.
- Replaced the mocked fixture with isolated OS-temp projects that invoke the shipped validators and production preflight/close scripts.

Checks:
- `Get-ChildItem template/scripts -Recurse -Filter *.mjs | node --check`: PASS for all 16 scripts.
- `node template/scripts/check-agent-config-registry.mjs`: PASS, 93 items, 0 errors.
- `node template/scripts/check-agent-links.mjs`: PASS, 211 Markdown files, 0 broken links.
- `node template/scripts/check-project-customization.mjs --template`: PASS.
- `node template/scripts/check-project-knowledge-loop.mjs`: PASS, 15 assertions.
- `node template/scripts/check-agent-compliance.mjs`: PASS; fixture copies are outside the source tree and always removed in `finally`.

### check-agent-compliance.mjs
```text
[START] check-agent-compliance
[END] check-agent-compliance PASS: 15 cases, 72 assertions.
```

## Portable Git And VM Delivery Guidelines

Date: 2026-08-21

Scope:
- Added canonical `git-change-management` and `vm-operations-runbook` skills with detailed, provider-neutral references and Cursor discovery adapters.
- Added always-on `delivery-safety` policy for Codex, Cursor, and Antigravity.
- Added canonical `docs/agent-rules/delivery-profile.md` so each installed project defines its own provider, branch, authorization, deployment, runtime, monitoring, and rollback facts without embedding secrets.
- Routed general deploys through `deployment-runbook`, Git mutation through `git-change-management`, and SSH/VM/service operations through `vm-operations-runbook`.
- Added optional phase-close `delivery` evidence validation for supported operation names, sanitized target, explicit authorization, and bounded action/result evidence.

Checks:
- Node syntax: PASS for all 16 scripts.
- Skill validation: PASS for both new canonical skills.
- Registry: PASS, 96 items, 0 errors.
- Markdown links: PASS, 221 files, 0 broken links.
- Template customization: PASS.
- Project knowledge fixture: PASS, 15 assertions with five canonical knowledge files.
- Agent compliance fixture: PASS, 15 isolated cases and 76 assertions.

```text
[END] check-agent-compliance PASS: 15 cases, 76 assertions.
```

## Deterministic Task Classification And Plan Gate

Date: 2026-08-21

Scope:
- Added cross-platform `question`, `basic`, `complex`, and `critical` classification with explicit risk signals.
- Added hybrid classification source: clear work may use policy classification; unclear or critical work requires a sanitized user-confirmation reference.
- Prevented critical-signal downgrade even when a task changes only one file.
- Added schema-v2 receipts with classification, signals, request summary, confirmation source, workspace baseline, and planning/open/closed states.
- Added `agent-plan-gate.mjs`. Complex/critical tasks cannot close until a valid plan passes; initial gating rejects source/config mutation performed before planning approval.
- Added plan hash drift protection, explicit refresh, critical approval, QC decision, rollback, authorization boundary, and failure recovery requirements.
- Upgraded `planning-workflow` and `plan-master`; added Codex, Antigravity, and Cursor always-on routing.

Checks:
- Node syntax: PASS for all 22 scripts.
- Cross-platform registry: PASS, 97 items, 0 errors.
- Markdown links: PASS, 226 files, 0 broken links.
- Template customization: PASS.
- Planning workflow and plan-master skill validation: PASS.
- Project knowledge fixture: PASS, 15 assertions.
- Agent compliance fixture: PASS, 18 isolated cases and 110 assertions.
- Adversarial coverage includes missing classification, `--simple` misuse, critical downgrade, unconfirmed critical work, pre-plan mutation, missing/shallow plan, approval failure, pending close, plan drift, refresh, and successful planned close.

```text
[END] check-agent-compliance PASS: 18 cases, 110 assertions.
```

## Skill Catalog Governance And Delivery Slicing

Date: 2026-08-21

Scope:

- Added a cross-platform skill authoring policy covering selection pointers,
  completion criteria, conditional references, canonical ownership, and
  pruning.
- Added `invocationMode` and `triggerBranches` to every registry skill and a
  hard gate for invalid modes and duplicate model-discoverable branches.
- Audited 58 entrypoints, consolidated four overlaps, and retained 54
  canonical skills.
- Split large Antigravity and project-delivery entrypoints into conditionally loaded
  references.
- Added facts-versus-decisions pre-install discovery, two-axis code review,
  tracer delivery slices, dependency graph validation, domain glossary, and
  module-depth architecture checks.
- Added the push-triggered delivery invariant: one coherent reversible commit
  per wave; push, poll, version/health/smoke verify, then open the next wave.

Checks:

- Registry: PASS, 94 items, 0 errors.
- Skill catalog: PASS, 54 skills, 0 hard errors, no entrypoint over 200 lines.
- Registry negative fixtures: PASS, 3 assertions including trigger collision
  and invalid invocation mode.
- Markdown links: PASS, 229 files, 0 broken links.
- Project customization: PASS, including six canonical knowledge files.
- Knowledge fixture: PASS, 15 assertions.
- Agent compliance: PASS, 18 cases and 114 assertions; includes unknown edge
  and cyclic dependency rejection.
- Provenance scan for the evaluated external repository name, URL, branded
  commands, and unique skill names: no matches in the kit.
