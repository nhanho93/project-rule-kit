---
last_verified: ''
evidence_sources: ''
impacted_modules: ''
decision_owner: ''
status: 'UNRESOLVED'
---

# Project Profile

Project name: `{{PROJECT_NAME}}`

Primary stack: `{{PRIMARY_STACK}}`

Test commands: `{{TEST_COMMANDS}}`

Build command: `{{BUILD_COMMAND}}`

Deploy policy: `{{DEPLOY_POLICY}}`

Database policy: `{{DATABASE_POLICY}}`

Value gate: `{{VALUE_GATE}}`

## How Agents Use This File

Read this file at session start. Treat it as the project overlay for otherwise
portable rules. First inspect the repository for discoverable facts, then ask
the user for unresolved decisions and domain context. Generic defaults are not
valid project facts. No mutation may begin while this profile or another
canonical project knowledge file remains `UNRESOLVED` or fails the installed
customization validator.
