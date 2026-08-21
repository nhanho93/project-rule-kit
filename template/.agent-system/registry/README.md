# Cross-Platform Registry

Registry files are JSON so they can be validated with plain Node.js and no
dependency install.

Run after any rule, skill, capability, or agent change:

```powershell
node scripts/check-agent-config-registry.mjs
node scripts/check-agent-links.mjs
node scripts/check-project-customization.mjs --template
```

Rules:

- Shared items need Cursor, Codex, and Antigravity adapters.
- Platform-specific items need explicit exclusions for other platforms.
- Canonical files live in `.agent-system` or `.agents`.
- `.cursor` files are Cursor-native adapters, not shared canonical bodies.
- Every skill declares `invocationMode` and one or more stable
  `triggerBranches`. Model-discoverable skills may not own the same branch.
- Skill entrypoints follow
  [the authoring standard](../policies/skill-authoring-standard.md).

Catalog validation:

```powershell
node scripts/check-skill-catalog.mjs
```
