# Plans

Store complex and critical plan artifacts in this directory. Use the canonical
[plan artifact contract](../../.agents/skills/planning-workflow/references/plan-contract.md).

Plan files are the only project files allowed to change between complex or
critical preflight and the initial plan gate. After a gated plan changes, rerun:

```text
node scripts/agent-plan-gate.mjs --task-id <id> --plan tasks/plans/<plan>.md --refresh
```
