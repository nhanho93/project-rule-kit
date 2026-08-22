---
name: documentation-templates
description: Use when creating or standardizing documentation, handovers, specs, runbooks, READMEs, or reusable doc formats.
---

# Documentation Templates

Create reusable document structures whose fields drive a decision, action or
verification. A template is a contract, not a collection of empty headings.

## When to Use

Use when repeated handovers, specs, runbooks, READMEs or evidence reports need a
consistent structure. Inspect audience, lifecycle, existing examples and the
consumer/validator before designing fields.

Do not template one-off prose or add mandatory fields without an owner and use.
Do not embed project-specific values in a reusable kit template.

## Workflow

1. Define document purpose, audience, creation trigger and completion action.
2. Separate required decision/evidence fields from optional explanatory detail.
3. Provide concise instructions and one realistic filled example for fields
   whose semantics are not obvious.
4. Encode status vocabulary, owner/next-action and freshness/version rules where
   stale documents create risk.
5. Link canonical rules instead of duplicating long bodies; use progressive
   references for branch-specific detail.
6. Test the template on one representative and one boundary case, then remove
   fields that do not change behavior.

## Limitations and Stop Conditions

- Uniform format cannot repair unclear ownership or invalid source facts.
- Excessive required fields encourage fabricated or copied content.
- Stop when no consumer, completion action or canonical owner exists.

## Example

```text
Runbook fields: target, authorization, precheck, action, verification, rollback.
Bad field: "Notes" with no consumer.
Completion: another operator can execute or stop without asking for hidden context.
```

Completion requires a tested structure, field semantics, ownership/freshness
rules and removal of non-actionable boilerplate.
