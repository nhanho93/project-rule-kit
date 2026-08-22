---
name: e2e-qc
description: Use when validating end-to-end workflows, browser paths, test data, screenshots, or release-quality user journeys with host-aware native-browser and Browser MCP fallback rules.
---

# E2E QC

Validate the actual authenticated user path on a named real-browser surface and
bind every PASS to reproducible data, browser trajectory and diagnostics.

## When to Use

Use for browser-visible behavior, forms, navigation, authorization/data scope,
browser-called APIs, visual states and release user journeys. Read the product
contract, route, personas, data factories and environment policy first.

Do not use screenshots, DOM dumps, direct HTTP calls or headless unit tests as a
substitute for a required user interaction. Do not mutate production merely to
create QC data; production mutation needs separate authorization.

## Test Contract

Before navigation, publish the route, persona, precondition, action, expected
state, negative/boundary case, diagnostics, run ID and teardown. Trace visible
output through the browser request and persisted source when data semantics
determine correctness.

At minimum cover the primary user journey and the highest-risk permission,
validation, or failure branch. Use isolated run IDs and non-production test
data, capture route/state evidence, inspect console/network signals where
available, and complete teardown even after a failed assertion.

## Browser surface preflight

1. Record the active host: Antigravity IDE/2.0, Agy CLI, Codex, or another supported agent.
2. Prefer a healthy native browser tool when the host exposes one. Antigravity IDE/2.0 can expose its Browser Subagent; do not assume terminal-first Agy CLI exposes the same capability.
3. If native browser tooling is unavailable or unhealthy, check whether Browser MCP X is installed and loaded. Packages that require this fallback should bundle an idempotent installer, checksum, version marker, and portable archive.
4. For Browser MCP X, default to `browser_qc_dedicated`. Use `browser_qc_current` only when the test requires the operator's current Chrome session.
5. Call `qc_session_info` before navigation. A server shown as `LOADED` proves schema registration, not a live browser connection.
6. If installation returns `RESTART_REQUIRED=true`, restart the affected CLI or IDE and continue in a fresh session.
7. Headed Playwright is the final local fallback when the native and MCP surfaces cannot run. Report the actual surface; never label Playwright evidence as Browser Subagent or Browser MCP evidence.
8. If no compliant real-browser surface remains, report the browser gate as BLOCKED instead of fabricating PASS.

## Evidence acceptance gate

Accept browser PASS only when the evidence names the host and surface, contains real tool-call trajectory, identifies the browser session, and includes artifacts for the tested route, state, viewport, and theme. Capture console and network diagnostics when available, plus test-data run ID and teardown status when the workflow mutates data.

Model prose, `/browser` text, terminal-only API checks, or screenshots without a matching trajectory do not prove that a browser surface executed. A silent surface substitution invalidates the PASS and requires a rerun under an explicit surface contract.

Detailed host matrix, Browser MCP provisioning, retry/quota behavior, and model routing live in [antigravity-orchestrator](../antigravity-orchestrator/SKILL.md). The reusable Gate A-D workflow lives in [project-delivery-pipeline](../project-delivery-pipeline/SKILL.md).

## Limitations and Stop Conditions

- Browser evidence proves only the named environment, identity, data and build.
- A visible success state does not override console, network or server errors.
- Stop as `BLOCKED`, not `SKIPPED`, when authentication, compliant browser
  surface, isolated data or teardown verification is unavailable.

## Example

```text
Case: department-scoped user opens a weekly report.
Positive: own department rows and exact IDs are visible.
Negative: forged other-department URL/API request is denied.
Evidence: browser trajectory, route screenshot, network response, server log,
run-scoped fixture IDs and zero-record teardown query.
```

Completion requires every declared case to PASS with matched evidence, or a
clear FAIL/BLOCKED result that keeps the release gate open.
