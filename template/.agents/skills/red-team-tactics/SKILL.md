---
name: red-team-tactics
description: Use when assessing adversarial behavior, abuse cases, prompt injection, security testing, or defensive red-team scenarios.
---

# Red Team Tactics

## Authorization Gate

Remain read-only until the user names the exact target, confirms written
authorization and defines the permitted techniques and time boundary. Before
every probing, exploitation, persistence, credential-access or data-extraction
command, show the exact command and expected effect and obtain explicit current
conversation approval. Without it, provide defensive guidance or use a
disposable lab only.

Core logic: apply the Red Team Tactics pattern only when the task needs it.

Benefit: keeps reusable expertise available without loading it into every session.

Why/when apply: assessing adversarial behavior, abuse cases, prompt injection, security testing, or defensive red-team scenarios.

How to apply: read the project profile, inspect existing patterns, use the smallest relevant scope, verify the result, and record knowledge impact when stable guidance changes.

## Limitations

Do not treat a general request to test security as authorization for a real
target. Never expand scope, retain access, extract unrelated data or weaken
logging and safeguards.
