# Project Customization

Use this file when adapting the kit to a project.

## Replace Project Variables

Fill these in `template/docs/agent-rules/project-profile.md` after copying:

| Variable | Meaning |
|---|---|
| `{{PROJECT_NAME}}` | Repository or product name |
| `{{PRIMARY_STACK}}` | Main runtime/framework |
| `{{TEST_COMMANDS}}` | Fast unit/type/lint commands |
| `{{BUILD_COMMAND}}` | Build command or "N/A" |
| `{{DEPLOY_POLICY}}` | How deploys happen and who approves |
| `{{DATABASE_POLICY}}` | Database names, env vars, mutation rules |
| `{{VALUE_GATE}}` | What makes work worth doing |

## Port Project-Specific Rules

For every existing project-specific rule, rewrite it into this shape:

```markdown
## Rule Name

Core logic: The portable behavior agents must preserve.
Benefit: What quality, speed, safety, or business outcome improves.
Why/when apply: Observable triggers for loading this rule.
How to apply: Concrete steps, checks, and evidence.
Project overlay: The project-specific facts, names, commands, or URLs.
```

Do not copy domain paragraphs that only make sense in one company. Keep the
guarantee and move project facts into `project-profile.md`.

## Add A New Skill

1. Read `.agent-system/policies/skill-authoring-standard.md`.
2. Add canonical skill: `.agents/skills/<skill-name>/SKILL.md`.
3. Add registry row with `invocationMode` and distinct `triggerBranches`:
   `.agent-system/registry/skills.json`.
4. Add Cursor trigger adapter when Cursor should auto-discover it.
5. Add Codex route in `.agent-system/registry/codex-skill-map.md`.
6. If the skill ships executable assets, keep them under its canonical
   directory, add a version marker and checksum for binary archives, and make
   provisioning idempotent plus merge-safe for existing configuration.
7. Run registry, catalog, link, customization, behavior validators, and
   parse-check any packaged scripts.

Before adding a new entrypoint, audit whether an existing canonical skill can
own the branch. Merge exact overlaps; use a separate specialist only when its
trigger and completion criteria are materially distinct.

## Add A New Agent

1. Add canonical profile: `.agents/agents/<agent-name>.md`.
2. Add Cursor adapter if Cursor should expose it.
3. Add registry row: `.agent-system/registry/agents.json`.
4. Keep the profile generic; put project facts in `project-profile.md`.
