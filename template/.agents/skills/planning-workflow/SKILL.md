---
name: planning-workflow
description: Use when work is complex, multi-file, multi-domain, high-risk, or needs phased execution before implementation.
---

# Planning Workflow

Core logic: plan enough to protect scope, ownership, and verification.

Benefit: reduces rework and keeps multi-step changes reviewable.

Why/when apply: auth, DB, deploy, multi-module changes, unclear requirements,
parallel work, or anything that cannot be safely completed as one small edit.

How to apply:

1. Read `.agent-system/policies/task-classification.md` and the project profile.
2. Perform read-only discovery before asserting files, architecture, commands, or risks.
3. Create the plan using [references/plan-contract.md](references/plan-contract.md).
4. Split implementation into tracer slices: each slice delivers a narrow,
   independently verifiable path through every layer it needs. Declare its
   blocking edges and completion evidence; avoid layer-only waves that cannot
   be verified on their own.
5. Record rollback/recovery and authorization boundaries for risky changes.
6. Obtain user confirmation for unclear requirements and approval for critical work.
7. Run `node scripts/agent-plan-gate.mjs --task-id <id> --plan <path>` before mutation.

For a wide mechanical migration that cannot stay green as an ordinary tracer
slice, use expand -> migrate batches -> contract. Keep the old and new forms
compatible until all declared migration edges are complete.

## Limitations and Stop Conditions

- Planning is read-only and does not authorize implementation or external
  mutations.
- Do not assert file paths, commands, dependencies, or architecture from memory
  when repository discovery can verify them.
- Stop when a material requirement is a decision rather than a discoverable
  fact; identify the owner and keep the affected edge blocked.

## Example

For a parser and template migration, map current producers/consumers and legacy
aliases, then plan a tracer slice containing one canonical field end to end:
generated template, validation, parser, persistence, error UX, fixtures, and E2E
decision. Expand to other fields only after that slice's evidence gate passes.
