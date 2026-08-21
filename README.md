# Project Rule Kit

Reusable cross-platform agent rules, skills, and agent profiles for Cursor,
Codex, and Antigravity.

Current skill consolidation and quality decisions are recorded in
[SKILL-CATALOG-AUDIT.md](SKILL-CATALOG-AUDIT.md).

The kit uses a small cross-platform router, loads task-specific capabilities on
demand, and enforces core engineering guarantees without placing every
platform-specific rule in every context window.

## What This Kit Provides

- `AGENTS.md` and `GEMINI.md` bootstrap files.
- Canonical shared policies under `.agent-system/policies`.
- Registry files that map policies, skills, capabilities, and agents.
- Canonical shared skills under `.agents/skills`.
- Canonical shared agent profiles under `.agents/agents`.
- Cursor trigger adapters under `.cursor`.
- Antigravity native rule and capability adapters under `.agents`.
- Codex capability maps under `.agent-system/registry/codex-capabilities`.
- Validation scripts for registry and link checks.
- Portable Browser MCP X QC fallback packages in the Antigravity orchestrator
  and project delivery pipeline skills, including installer, checksum, and version data.
- Portable Git and VM delivery runbooks. Project-specific branches, providers,
  environments, process managers, and rollback procedures live in
  `docs/agent-rules/delivery-profile.md`, not in shared skills.

## Mandatory Pre-Install Discovery

Before every fresh install, reinstall, or upgrade, the agent MUST pause and do
all of the following before copying or changing any file:

1. Build a facts-versus-decisions tree. Facts are discovered by the agent;
   decisions are confirmed by the user. A decision may be asked only after its
   prerequisite facts and upstream decisions are known.
2. Read the target project's base source in read-only mode. At minimum inspect
   repository status, root manifests/lockfiles, source layout, test/build/CI
   configuration, deployment/runtime configuration, and existing `AGENTS.md`,
   `GEMINI.md`, `.agent-system`, `.agents`, `.cursor`, `docs/agent-rules`, and
   `tasks` surfaces when present.
3. Report detected stack, architecture, conventions, commands, Git/delivery
   model, existing rule collisions, missing evidence, and proposed
   customization/merge actions. Mark every item as `FACT`, `DECISION`, or
   `UNRESOLVED`; do not infer unknown project facts.
4. Ask only unresolved decisions: target directory, fresh/existing mode,
   intended agent platforms, required workflows, preservation/merge policy,
   and any collision the source cannot settle. Provide a recommended answer
   and explain its impact. Do not ask the user for facts available in source.
5. Recompute the decision tree after each answer until no required branch is
   unresolved. Ask the user to confirm the final install/customization scope.
   Only after
   confirmation may the agent copy, merge, bootstrap, or modify the target.

Reading this kit alone is not sufficient discovery. The target project's real
source and configuration are the evidence used to customize the installed kit.
After installation, the agent must ask the user for every project decision or
domain fact that source inspection cannot establish. The installed validator is
a hard start gate: no implementation or delivery mutation may begin until all
canonical project knowledge is verified.

## Install Into A Fresh Project

From this folder:

```powershell
Copy-Item -Recurse -Force .\template\* D:\Path\To\YourProject\
Set-Location D:\Path\To\YourProject
```

For an existing project, follow [install.md](install.md): copy the template to a
temporary directory, then merge it. Do not use `-Force` directly over existing
rules, delivery profiles, handovers, todos, or pending work.

```powershell
# 1. Inspect mode (safe, shows what will happen)
node scripts/bootstrap-project-context.mjs

# 2. Apply mode (modifies files)
node scripts/bootstrap-project-context.mjs --apply

# 3. Human Review (clear remaining REVIEW_REQUIRED, TODO, FIXME)
# Manually open and edit docs/agent-rules/*.md files to replace placeholders with real project facts.
# For Git/deploy/VM work, fully review docs/agent-rules/delivery-profile.md.

# 4. Installed validation (verifies everything is resolved)
node scripts/check-project-customization.mjs --installed

# 5. Registry/Link validation
node scripts/check-agent-config-registry.mjs
node scripts/check-skill-catalog.mjs
node scripts/check-skill-registry-fixtures.mjs
node scripts/check-agent-links.mjs

# 6. Compliance Loop validation
node scripts/check-project-knowledge-loop.mjs
node scripts/check-agent-compliance.mjs
```

## Agent Workflow Execution

When acting as an agent in a fully customized project:

Before running a command, the agent states: proposed classification, matching
signals, reason, and whether it will answer, execute immediately, or create a
plan. For unclear or critical work it asks the user to confirm; confirmation
may raise risk but cannot downgrade a critical signal.

```text
# 1a. Read-only question
node scripts/agent-preflight.mjs --simple

# 1b. Basic mutation: execute after this gate
node scripts/agent-preflight.mjs --task-id <id> --classification basic --request-summary "<sanitized>" --signal single_domain --signal small_reversible

# 1c. Complex mutation: plan before execution
node scripts/agent-preflight.mjs --task-id <id> --classification complex --request-summary "<sanitized>" --signal multi_file
node scripts/agent-plan-gate.mjs --task-id <id> --plan tasks/plans/<plan>.md

# 1d. Critical mutation: requires user confirmation and approved plan
node scripts/agent-preflight.mjs --task-id <id> --classification critical --request-summary "<sanitized>" --signal deployment --classification-source user_confirmed --confirmation-ref "<sanitized>"
node scripts/agent-plan-gate.mjs --task-id <id> --plan tasks/plans/<critical-plan>.md

# 2. Do the work...

# 3. Create manifest (e.g. evidence/manifest.json)
```

```json
{
  "schema_version": 1,
  "task_id": "<id>",
  "classification": "complex",
  "knowledge_impact": "CHANGED",
  "knowledge_files_impacted": ["docs/agent-rules/project-profile.md"],
  "reason": "Updated profile for new module.",
  "verification": [
    {
      "command": "npm test",
      "exit_code": 0,
      "evidence_path": "evidence/test-output.log",
      "sanitized_output_summary": "12 tests passed, 0 failed."
    }
  ],
  "continuity": {
    "pending_action": "UPDATED",
    "reason": "Moved tasks to handover"
  },
  "delivery": {
    "operations": ["git", "deployment"],
    "target": "origin/release and staging",
    "authorized": true,
    "evidence": [
      {"action": "push verified commit", "result": "PASS"},
      {"action": "staging health and smoke checks", "result": "PASS"}
    ]
  }
}
```

```text
# 4. Close session
node scripts/agent-phase-close.mjs --task-id <id> --manifest evidence/manifest.json
```

Explanation:
- `--task-id <id>`: Uniquely identifies the task session.
- `--classification`: `basic`, `complex`, or `critical`; high-risk signals cannot be downgraded.
- `--classification-source user_confirmed --confirmation-ref "..."`: Required for critical or unclear work.
- `--resume`: Used in preflight to rehydrate existing open task context without changing hashes.
- `--safe-reset`: Used in preflight to establish a new baseline (only allowed if previous task is closed).
- `agent-plan-gate`: Required before any complex/critical mutation; phase close rejects missing or drifted plan hashes.
- `evidence`: Proof of verification required for CHANGED/NO_CHANGE (exit 0) or UNRESOLVED.
- `continuity`: Requires monotonic suffix advance or updated content for handover and todo. UNRESOLVED requires `UPDATED` pending action.
- `receipt state`: Managed locally in `.agent-system/state/<id>.json`.
- `freshness`: Checks if canonical knowledge is stale (use `--strict-freshness` to fail on stale).
- `simple mode`: Reserved for read-only questions; it does not create a receipt or authorize mutation.
- `continuity gate`: Enabled by default in `.agent-system/compliance.json`. Before close, update both chain heads (`handover*.md`, `todo*.md`) and reconcile the single live `pending_todo.md`; declare its action in `continuity`.
- `delivery`: For Git/VM/deployment/migration operations, record only sanitized target aliases and bounded action/results. The runbooks still require action-specific operator authorization before mutation.

## Portable Git And VM Routing

- Git mutation or recovery: `.agents/skills/git-change-management/SKILL.md`
- General release flow: `.agents/skills/deployment-runbook/SKILL.md`
- SSH/VM/service/runtime operations: `.agents/skills/vm-operations-runbook/SKILL.md`
- Project-specific facts: `docs/agent-rules/delivery-profile.md`

The shared skills do not assume GitHub, GitLab, PM2, systemd, Docker, a fixed
SSH command, or a particular release layout. Configure those choices in the
project overlay after installation.

## Design Rule

Do not port project-specific wording verbatim. Extract:

- core logic
- benefit
- why and when it applies
- how to apply it

Example: a company-specific ROI rule becomes a generic value gate:

> For resource-heavy work, explain the user/business value, expected impact,
> and why this is worth doing now.

## Platform Strategy

| Platform | Reads by default | Skills |
|---|---|---|
| Cursor | `AGENTS.md`, `.cursor/rules/*.mdc` | `.cursor/skills/*/SKILL.md` trigger adapters |
| Codex | `AGENTS.md` hierarchy | `.agent-system/registry/codex-skill-map.md` |
| Antigravity | `GEMINI.md`, `AGENTS.md` | `.agents/skills/*/SKILL.md` canonical |

Each platform should read only its own adapter plus shared canonical content.
Do not make Codex or Antigravity load `.cursor/rules` by default.

For browser QC, prefer the host's healthy native browser capability. When it is
unavailable, the packaged Antigravity and project delivery skills can verify or install
Browser MCP X without overwriting unrelated MCP configuration. A restart is
required before using MCP tools installed during the current session.
