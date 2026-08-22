# Skill Authoring Standard

Use this policy whenever a skill or a skill registry entry is created, split,
merged, or materially revised.

## Selection Pointer

The skill name and description are selection metadata. They must identify the
capability and the distinct request branches that should activate it. Avoid
catch-all descriptions, duplicated synonyms, and descriptions that overlap a
more specific skill without declaring a routing boundary.

Registry entries declare:

- `invocationMode`: `user`, `model`, or `both`.
- `triggerBranches`: stable lower-case branch IDs representing distinct user
  intents. A branch may belong to only one model-discoverable skill.
- Optional `entrypointPolicy` only when a project overlay must temporarily
  exceed 200 lines. It requires `allowOver200: true`, a concrete `reason`, a
  `followupOwner`, and a bounded `nextAction`. The catalog reports a warning;
  undeclared oversized entrypoints still fail.
- `risk`: `safe`, `critical`, or `offensive`.
- `maturity`: `core`, `stable`, or `experimental`.
- `depth`: `router`, `workflow`, or `domain-reference`.
- `verificationProfile`: `standard`, `browser`, `security`, or `deployment`.
- `requires` and `conflictsWith`: exact registry IDs; empty arrays are explicit.

Use `user` when a workflow must start only from an explicit user request. Use
`model` when it is an internal discipline selected automatically. Use `both`
when either path is intentional.

## Instruction Shape

1. Put the required sequence and safety invariants in `SKILL.md`.
2. End every required step with an observable completion condition.
3. Put branch-specific procedures, schemas, large examples, and platform
   details in a referenced file and state exactly when it must be read.
4. Keep one authoritative location for each rule. Adapters point to canonical
   content instead of copying it.
5. State the desired behavior positively. Use prohibitions only for concrete
   safety or scope boundaries and pair them with the required action.

## Pruning Gate

Before closing a skill change:

- Remove lines that do not change agent behavior or decisions.
- Remove facts that can be read cheaply and reliably from manifests, source,
  configuration, or tool help.
- Merge exact capability duplicates; preserve specialized skills only when
  their trigger branches and completion criteria are materially different.
- Move conditional detail out of an oversized entrypoint before adding more.
- Verify every reference is reachable from the branch that needs it.
- Run registry, catalog, link, customization, and relevant behavior fixtures.
- Do not update the quality-warning or semantic-drift baseline until the diff is
  reviewed. Baseline updates acknowledge current state; they do not prove skill
  quality or permit new generic scaffolds.

Completion means the skill has discriminating selection metadata, checkable
completion criteria, no undeclared trigger collision, and no duplicated
canonical instruction body.
