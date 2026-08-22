---
name: documentation-update
description: Use when code, APIs, workflows, rules, architecture, setup, or user behavior changes require documentation or handoff updates.
---

# Documentation Update

Core logic: docs should preserve decisions and reusable knowledge.

Benefit: future work starts faster and avoids rediscovery.

Why/when apply: behavior changes, public contracts, setup changes, new folders,
new commands, new rules, phase close.

How to apply:

1. Identify audience: user, developer, operator, future agent.
2. Update the closest existing doc.
3. Keep docs concise and factual.
4. Record commands, paths, and decisions.
5. Avoid duplicating content across docs.
6. Link to canonical source when possible.

## Limitations and Stop Conditions

- Do not turn temporary task notes into permanent rules or duplicate canonical
  content across README, runbooks, and handover files.
- Documentation cannot substitute for executable verification or unresolved
  implementation evidence.
- Stop when a claimed fact conflicts with source/config; mark it unresolved and
  identify the owner instead of choosing a convenient version.

## Example

After a command changes, update the nearest setup/runbook section with the new
command, prerequisites, expected result, and rollback note. Link to canonical
configuration, remove the stale instruction, and record `last_verified` evidence
instead of copying the procedure into several documents.

Completion: the intended audience can follow one canonical, evidence-backed
instruction and stale or conflicting guidance has an owner or is removed.
