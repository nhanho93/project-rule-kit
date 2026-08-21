# Platform Adapters

This document maps platform tools to portable capabilities. It is not a rule
dump.

| Capability | Cursor | Codex | Antigravity |
|---|---|---|---|
| Progress | Native todo/task UI | Plan updates or chat checklist | Native task/progress UI |
| Read/search | Cursor file tools | Shell/read tools | Native file tools |
| Patch | Cursor edit tools | Patch/edit tools | Native edit tools |
| Diagnostics | ReadLints + terminal | Terminal source of truth | IDE diagnostics + terminal |
| Delegation | Cursor agents | Subagents if available | Antigravity agents |
| Browser QC | Cursor/browser tooling | Playwright or browser tool | Native browser/e2e tools |

Do not weaken approvals, verification, safe write, or security because a tool
name differs.
