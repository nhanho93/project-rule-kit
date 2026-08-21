---
name: server-management
description: Use when operating servers, services, processes, logs, health checks, reverse proxies, or runtime environments.
---

# Server Management

Core logic: apply the Server Management pattern only when the task needs it.

Benefit: keeps reusable expertise available without loading it into every session.

Why/when apply: operating servers, services, processes, logs, health checks, reverse proxies, or runtime environments.

How to apply: read the project profile and `docs/agent-rules/delivery-profile.md`. For SSH or VM runtime work, load `vm-operations-runbook`; otherwise inspect the platform-native procedure, use the smallest authorized scope, verify the result, and record knowledge impact when stable guidance changes.
