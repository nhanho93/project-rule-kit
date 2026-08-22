---
name: mcp-builder
description: Use when designing or implementing MCP servers, tools, schemas, resource templates, or connector integrations.
---

# Mcp Builder

Design MCP capabilities as small, typed, permission-aware contracts with outputs
an agent can validate without guessing hidden state.

## When to Use

Use for MCP tools, resources, prompts, schemas or connector servers. First map
the external system's authorization, rate limits, side effects and stable IDs.

Do not expose a broad shell/HTTP escape hatch when bounded operations suffice.
Do not encode secrets, human approval or mutable state in tool descriptions.

## Workflow

1. Choose tool for actions, resource for addressable read context and prompt only
   for reusable interaction guidance; avoid overlapping capability names.
2. Define strict input schemas, defaults, limits and mutually exclusive fields.
3. Separate read-only discovery from mutation and mark destructive/external side
   effects so the host can enforce approval.
4. Return concise structured results with stable IDs, error codes, pagination and
   evidence references; redact credentials and sensitive payloads.
5. Handle timeout, retry, duplicate mutation, partial provider failure and rate
   limiting explicitly.
6. Test schema rejection, authorization denial, result truncation and safe
   recovery in addition to the success path.

## Limitations and Stop Conditions

- MCP registration does not prove a live backend or permission.
- Model-friendly descriptions cannot replace server-side validation.
- Stop when credential ownership, tenant boundary, mutation idempotency or
  external approval policy is unresolved.

## Example

```text
Tool: create_issue(project_id, title, idempotency_key).
Reject: arbitrary project URL and raw authorization header.
Return: issue_id, status, provider_request_id and retry classification.
```

Completion requires distinct capability ownership, typed schemas, authorization
and side-effect policy, bounded results and failure-injection evidence.
