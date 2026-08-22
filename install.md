# Install Guide

## Mandatory Pre-Install Gate

Before every install, reinstall, or upgrade, the agent must remain read-only
and complete this sequence:

1. Create a facts-versus-decisions tree. Discover facts from the target and ask
   only decisions whose prerequisite facts are already established.
2. Inspect the target repository's base source and configuration: Git status,
   manifests and lockfiles, source structure, test/build/CI, deploy/runtime,
   existing agent rules, project knowledge, and continuity files.
3. Present an evidence-backed customization and collision report. Label every
   entry `FACT`, `DECISION`, or `UNRESOLVED`; mark unknown facts rather than
   guessing them.
4. Ask the current decision frontier, with a recommended answer and impact for
   each choice. Typical branches include target, install mode, agent platforms,
   workflows, preservation/merge policy, and unresolved collisions.
5. Recompute until no required branch remains unresolved, then obtain user
   confirmation for the final install and merge scope.
6. Only then perform the relevant fresh-project or existing-project procedure.

The same rule applies to the first task after installation: the agent must read
the target source, ask the user for unresolved project decisions and domain
context, customize the canonical knowledge files, and pass the installed
validator before any mutation. Generic defaults must never be treated as
project facts.

The confirmation authorizes only the described file integration. It does not
authorize commit, push, deployment, VM mutation, secret access, or destructive
replacement.

## Fresh Project

```powershell
$target = "D:\Path\To\Project"
$kit = "D:\Project\Project-Rule-Kit"
Set-Location $kit

# Preview is zero-write and produces a state-bound approval digest.
$plan = node .\scripts\rulekit-install.mjs --target $target | ConvertFrom-Json
$plan.operations | Format-Table kind, path, reason
if ($plan.hasCollisions) { throw "Resolve collisions manually, then preview again." }

node .\scripts\rulekit-install.mjs --target $target --apply --approve $plan.approvalDigest
Set-Location $target

# 1. Inspect mode (safe, shows what will happen)
node scripts/bootstrap-project-context.mjs

# 2. Apply mode (modifies files)
node scripts/bootstrap-project-context.mjs --apply

# 3. Human Review (clear remaining REVIEW_REQUIRED, TODO, FIXME)
# Manually open and edit docs/agent-rules/*.md files to replace placeholders with real project facts.
# Fully review delivery-profile.md before allowing Git, deployment, or VM mutations.

# 4. Installed validation (verifies everything is resolved)
node scripts/check-project-customization.mjs --installed
node scripts/sync-rulekit-stack.mjs --write
node scripts/check-rulekit-stack.mjs

# Review every dimension; keep an explicit gap rather than inventing coverage.
# Edit .agent-system/registry/capability-coverage.json, then:
node scripts/build-skill-selection-evidence.mjs --write
node scripts/check-skill-selection-evidence.mjs

# 5. Registry/Link validation
node scripts/check-agent-config-registry.mjs
node scripts/check-skill-catalog.mjs
node scripts/check-skill-registry-fixtures.mjs
node scripts/check-agent-links.mjs
node scripts/check-agent-links-fixtures.mjs
node scripts/check-skill-drift.mjs

# 6. Compliance Loop validation
node scripts/check-project-knowledge-loop.mjs
node scripts/check-agent-compliance.mjs
node scripts/rulekit-doctor.mjs
```

## Agent Workflow Execution

When acting as an agent in a fully customized project:

The agent first states its proposed classification, signals, reason, and next
action. Unclear or critical work requires user confirmation; detected critical
signals cannot be downgraded to basic.

```text
# 1a. Read-only question
node scripts/agent-preflight.mjs --simple

# 1b. Basic mutation
node scripts/agent-preflight.mjs --task-id <id> --classification basic --request-summary "<sanitized>" --signal single_domain --signal small_reversible

# 1c. Complex mutation: gate the plan before execution
node scripts/agent-preflight.mjs --task-id <id> --classification complex --request-summary "<sanitized>" --signal multi_file
node scripts/agent-plan-gate.mjs --task-id <id> --plan tasks/plans/<plan>.md

# 1d. Critical mutation
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
    "operations": ["git", "vm", "deployment"],
    "target": "origin/release and staging-vm alias",
    "authorized": true,
    "evidence": [
      {"action": "remote commit verification", "result": "PASS"},
      {"action": "release health and smoke checks", "result": "PASS"}
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
- `--classification`: `basic`, `complex`, or `critical`; critical signals cannot be downgraded.
- `--classification-source user_confirmed --confirmation-ref "..."`: Required for critical or unclear work.
- `--resume`: Used in preflight to rehydrate existing open task context without changing hashes.
- `--safe-reset`: Used in preflight to establish a new baseline (only allowed if previous task is closed).
- `agent-plan-gate`: Required before complex/critical mutation and after material plan changes (`--refresh`).
- `evidence`: Proof of verification required for CHANGED/NO_CHANGE (exit 0) or UNRESOLVED.
- `continuity`: Requires monotonic suffix advance or updated content for handover and todo. UNRESOLVED requires `UPDATED` pending action.
- `receipt state`: Managed locally in `.agent-system/state/<id>.json`.
- `freshness`: Checks if canonical knowledge is stale (use `--strict-freshness` to fail on stale).
- `simple mode`: Reserved for read-only questions; it does not create a receipt or authorize mutation.
- `continuity gate`: Enabled by default in `.agent-system/compliance.json`. Before close, update both chain heads (`handover*.md`, `todo*.md`) and reconcile the single live `pending_todo.md`; declare its action in `continuity`.
- `delivery`: For Git/VM/deployment/migration operations, record sanitized target aliases and bounded action/results; authorization remains action-specific.

## Configure Git And Runtime Delivery

After bootstrap, edit `docs/agent-rules/delivery-profile.md` using evidence from
the actual repository, CI/CD configuration, runtime, and operator decision.
Do not store credentials, private keys, tokens, or secret connection strings.

Agents route Git mutations to `git-change-management`, general releases to
`deployment-runbook`, and SSH/VM/service work to `vm-operations-runbook`.

## Existing Project

1. Run the installer preview against the real target; do not pre-copy files.
2. Resolve every `unmanaged-existing` or `managed-local-drift` collision by
   manual review. Existing content remains untouched.
3. Preview again and apply only the new digest from the collision-free plan.
4. Merge `AGENTS.md` and `GEMINI.md` manually if they already exist.
5. Keep project-specific rules as overlays in `docs/agent-rules`.
6. Refresh desired state and selection evidence after customization.
7. Run `rulekit-doctor.mjs` before asking agents to use the kit.

If the project already has another registry, preserve it and declare an
optional composition entry in `.agent-system/registry/extensions.json` rather
than replacing the portable JSON registry. Each entry must provide a contained
`.mjs` validator, exact source paths, and an owner. The primary registry check
runs every declared extension and fails when any extension fails.

For a temporary project-overlay skill entrypoint over 200 lines, declare
`entrypointPolicy` in `skills.json` with `allowOver200: true`, a concrete
reason, follow-up owner, and next action. This produces a warning, not a silent
bypass; undeclared oversized entrypoints remain errors.

## Optional Browser MCP X Provisioning

Do not install the browser fallback during a normal kit copy. Install it only
when a QC task cannot use a healthy native browser surface. From the target
project root, run one of:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\.agents\skills\antigravity-orchestrator\scripts\ensure-browser-mcp-x.ps1 -Agent Antigravity -InstallIfMissing
powershell -NoProfile -ExecutionPolicy Bypass -File .\.agents\skills\project-delivery-pipeline\scripts\ensure-browser-mcp-x.ps1 -Agent Codex -InstallIfMissing
```

If the script prints `RESTART_REQUIRED=true`, restart the selected agent before
QC. Then verify both MCP servers, call `qc_session_info`, and confirm a live
browser connection before navigation.

## No-Overwrite Rule

Before copying into an existing project:

- read existing `AGENTS.md`, `GEMINI.md`, `.cursor`, `.agents`, and `.agent-system`;
- merge instead of replacing;
- run `git status` before and after;
- stop if untracked content disappears.
