---
last_verified: ''
evidence_sources: ''
impacted_modules: ''
decision_owner: ''
status: 'UNRESOLVED'
---

# Delivery Profile

This file is the project-specific overlay for Git and runtime operations. Keep
credentials, private keys, tokens, and secret connection strings outside it.

## Repository

- Provider: `{{GIT_PROVIDER}}`
- Default branch: `{{DEFAULT_BRANCH}}`
- Branch convention: `{{BRANCH_POLICY}}`
- Commit and push authorization: `{{PUSH_POLICY}}`
- Required pre-push checks: `{{PRE_PUSH_CHECKS}}`
- Protected branch or review policy: `{{PROTECTED_BRANCH_POLICY}}`

## Deployment

- Environments and promotion order: `{{DEPLOY_ENVIRONMENTS}}`
- Deployment transport: `{{DEPLOY_TRANSPORT}}`
- Deployment strategy: `{{DEPLOY_STRATEGY}}`
- Approval policy: `{{DEPLOY_APPROVAL_POLICY}}`
- Health and smoke checks: `{{DEPLOY_HEALTH_CHECKS}}`
- Rollback strategy: `{{ROLLBACK_STRATEGY}}`

## Runtime Or VM

- Runtime type: `{{RUNTIME_TYPE}}`
- Connection reference: `{{CONNECTION_REFERENCE}}`
- Process manager or orchestrator: `{{PROCESS_MANAGER}}`
- Reverse proxy or ingress: `{{REVERSE_PROXY}}`
- Release layout: `{{RELEASE_LAYOUT}}`
- Sanitized log sources: `{{LOG_SOURCES}}`
- Monitoring and alerting: `{{MONITORING_POLICY}}`

## Safety Notes

- Refer to connection aliases or secret-manager entries, never secret values.
- If any value is unknown, keep it `REVIEW_REQUIRED` and do read-only discovery
  before proposing or performing a mutation.
