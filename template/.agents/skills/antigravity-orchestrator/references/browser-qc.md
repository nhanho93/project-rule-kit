# Browser QC Routing

## E2E QC Contract and Skill Installation

For project E2E QC, prefer Antigravity CLI with the repository's `e2e-qc` skill. Before the first QC run on an account/configuration:

1. Run `agy -p "/skills"` and confirm `e2e-qc` is listed.
2. If missing, locate the repository canonical skill (normally `.agents/skills/e2e-qc/`) and install or synchronize it into Antigravity's discovered skill directory (currently `%USERPROFILE%\.gemini\config\skills\e2e-qc\` on Windows). Preserve `SKILL.md` plus every directly referenced file.
3. Rerun `/skills`; do not claim installation success until `e2e-qc` appears.
4. Identify the active host before choosing browser tooling: Agy CLI, Antigravity IDE, or Antigravity 2.0. Do not infer capability from a shared account or harness.
5. If the native browser is unavailable or unhealthy, run the bundled Browser MCP X preflight/installer before QC; then prove the selected MCP tool binding in a fresh host session.
6. Enforce the skill's real-browser, factory, teardown, evidence, DEV-only, and same-wave RCA/re-QC gates. Terminal-only tests cannot establish browser PASS when the QC skill requires browser evidence.

### Browser capability matrix and fallback order

Choose by host and test need, not by marketing name:

| Host | Primary | Fallback | Constraint |
|---|---|---|---|
| Antigravity IDE / 2.0 | Built-in Browser Subagent | `browser_qc_dedicated`, then `browser_qc_current`, then headed Playwright | Native agent uses Chrome/CDP, multimodal inspection, and saves screenshot/video artifacts. |
| Agy CLI | `browser_qc_dedicated` | `browser_qc_current`, then headed Playwright | The built-in Browser Subagent is not available in Agy CLI as of the current Google codelab. `/browser` is not proof of activation. |
| Codex fallback | Available native real-browser connector | Browser MCP X or headed Playwright | Preserve the same cases, evidence, factory, and teardown contract. |

- Prefer `browser_qc_dedicated` for repeatable, destructive, clean-session, visual-matrix, or isolated-account QC.
- Use `browser_qc_current` only when the task explicitly requires the user's current Chrome login state, tabs, or extensions.
- Call `qc_session_info` first for either Browser MCP X server. Verify `instance`, ports, connection state, and unrestricted debug-tool availability before navigation.
- A server marked `LOADED` proves only schema registration. It does not prove that Chrome/Chromium or the extension is connected.
- Use headed Playwright when MCP/native browser is unavailable and the test can run in an isolated session. Record that the fallback changed; do not present Playwright artifacts as Browser MCP or Browser Subagent evidence.

### Bundled Browser MCP X fallback

This skill package contains:

- `assets/browser-mcp-x-qc-portable.zip`
- `assets/browser-mcp-x-qc-portable.sha256`
- `assets/browser-mcp-x-qc-portable.version`
- `scripts/ensure-browser-mcp-x.ps1`

Use the package only after native browser capability has been checked and found unavailable or unhealthy. Do not install MCP merely because a task mentions QC.

On Windows, run from this skill directory:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\ensure-browser-mcp-x.ps1 -Agent Antigravity -InstallIfMissing
```

For Codex fallback, replace `Antigravity` with `Codex`. The script is idempotent: it verifies the installed version, runtime relays, both MCP config entries, package SHA256, portable self-test, and post-install state. The portable installer backs up and merges agent configuration rather than replacing unrelated MCP servers.

If output contains `RESTART_REQUIRED=true`, restart the affected CLI/IDE before QC. In the fresh session:

1. Confirm `browser_qc_current` and `browser_qc_dedicated` are enabled in `/mcp`.
2. Select the required session; default to `browser_qc_dedicated`.
3. Call `qc_session_info` and verify the instance plus live browser connection.
4. Only then execute the QC case matrix.

If installation, restart, MCP loading, or browser connection cannot be completed, use the next approved fallback and report the browser gate as BLOCKED when no compliant surface remains.

Before accepting browser evidence, inspect the trajectory/tool calls. Screenshots created by `chromium.launch`, Playwright CLI, or a Node harness do not prove that the required Browser MCP ran. If the agent substitutes headless Playwright, stop the run, reject its PASS/evidence, remove only its isolated artifacts, and retry through a compliant browser surface.

Current CLI caveat: the official Google UI-testing codelab states that the built-in Browser Subagent is available in Antigravity IDE and 2.0 but not in terminal-first Agy CLI. Recheck official documentation after an Agy upgrade before changing this rule. Do not assume `/browser` activates it. Verify slash commands with `agy -p "/help"`; an unknown slash command may fall through to the model and produce a capability claim without any browser tool call. Treat trajectory evidence, not prose, as truth.

Official references: [Google UI automation codelab](https://codelabs.developers.google.com/agentic-ui-automation-with-antigravity#9), [Antigravity MCP](https://antigravity.google/docs/mcp), and [Antigravity permissions](https://antigravity.google/docs/permissions).

Configure and verify Browser MCP X in Antigravity's MCP panel before retrying. On Windows, the CLI reads `%USERPROFILE%\.gemini\config\mcp_config.json`; the expected servers are `browser_qc_current` and `browser_qc_dedicated`. Every higher-priority project MCP config must parse successfully, the chosen server must be enabled in `/mcp`, and its Chrome/Chromium session must be connected. Because interactive CLI loads MCP servers in the background, do not test tool availability in the first instant of a new interactive turn; wait for MCP startup or use a fresh bounded print-mode preflight.

### Evidence acceptance gate

Accept browser PASS only when all applicable proof exists:

1. Host and selected browser surface are named.
2. Trajectory contains calls from that surface; prose claims are insufficient.
3. Session identity is captured (`qc_session_info` for Browser MCP X).
4. Screenshots or native browser artifacts correspond to the tested route, state, theme, and viewport.
5. Console/network failures are collected or explicitly reported unavailable.
6. Factory run ID and teardown result are recorded.

If the agent silently substitutes another surface, reject the PASS, retain sanitized diagnostic artifacts, and rerun with an explicit surface contract.

If all Antigravity model pools are exhausted, fall back to Codex using the same canonical `e2e-qc` skill and available real-browser tooling. Preserve the same cases and evidence rules; report BLOCKED rather than fabricating PASS when no compliant browser is available.
