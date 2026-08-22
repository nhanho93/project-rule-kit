---
name: project-context-router
description: Use when a project needs a thin router that maps repository profile, platform adapters, and task-specific skills without loading everything.
---

# Project Context Router

Core logic: route project work through a thin project profile and on-demand skills.

Benefit: keeps startup context small while preserving project-specific guarantees.

Why/when apply: when a repo needs a project router skill for agents.

How to apply: read AGENTS.md, project-profile.md, registry, then one to three task skills.

## Limitations and Stop Conditions

- Route to canonical skills; do not duplicate their full procedures in this
  entrypoint or load the entire catalog by default.
- Do not invent missing project facts. Stop and request the project-specific
  decision when the profile, architecture, or delivery environment is unknown.

## Routing Example

For a database-backed UI change, load the project profile, route planning to the
planning skill, implementation safety to database migration guidance, and real
UI verification to browser QC. Do not also load unrelated language, deployment,
or security skills unless discovery activates those branches.

Completion: the task is routed to one to three canonical skills, every activated
branch has a reason, and missing project decisions are explicit.
