# Cross-Platform Registry

Registry files are JSON so they can be validated with plain Node.js and no
dependency install.

Run after any rule, skill, capability, or agent change:

```powershell
node scripts/check-agent-config-registry.mjs
node scripts/check-agent-links.mjs
node scripts/check-agent-links-fixtures.mjs
node scripts/check-project-customization.mjs --template
```

Rules:

- Shared items need Cursor, Codex, and Antigravity adapters.
- Platform-specific items need explicit exclusions for other platforms.
- Canonical files live in `.agent-system` or `.agents`.
- `.cursor` files are Cursor-native adapters, not shared canonical bodies.
- Every skill declares `invocationMode` and one or more stable
  `triggerBranches`. Model-discoverable skills may not own the same branch.
- Every skill declares `risk`, `maturity`, `depth`, `verificationProfile`,
  `requires`, and `conflictsWith`. Current quality debt is frozen in
  `skill-quality-warning-baseline.json`; new warning codes fail validation.
- Skill entrypoints follow
  [the authoring standard](../policies/skill-authoring-standard.md).
- `extensions.json` is optional composition metadata for an installed project
  that already owns another registry. Each entry declares a contained Node.js
  validator, its source paths, and an owner. Extension failure fails the
  combined registry gate; an empty array preserves the portable default.

Example installed-project extension:

```json
[
  {
    "id": "legacy-registry",
    "owner": "project maintainer",
    "validator": "scripts/check-legacy-registry.mjs",
    "sources": [".agent-system/registry/legacy-registry.json"]
  }
]
```

Catalog validation:

```powershell
node scripts/check-skill-catalog.mjs
node scripts/check-skill-drift.mjs
node scripts/check-rulekit-stack.mjs
node scripts/check-skill-selection-evidence.mjs
```

After an intentional reviewed change, update only the relevant baseline:

```powershell
node scripts/check-skill-catalog.mjs --update-baseline
node scripts/check-skill-drift.mjs --update-baseline
node scripts/sync-rulekit-stack.mjs --write
node scripts/build-skill-selection-evidence.mjs --write
```
