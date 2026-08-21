# CLI Runtime and Recovery

## CLI Binary Preflight and Install

On Windows, do not conclude that the CLI is unavailable merely because `agy` is not recognized. Check the absolute binary path first, then refresh the current process PATH:

```powershell
$antigravityBin = Join-Path $env:LOCALAPPDATA 'agy\bin'
$antigravityExe = Join-Path $antigravityBin 'agy.exe'

if (Test-Path -LiteralPath $antigravityExe) {
  & $antigravityExe --version
  if (-not (($env:Path -split ';') -contains $antigravityBin)) {
    $env:Path = "$antigravityBin;$env:Path"
  }
}

Get-Command agy -ErrorAction SilentlyContinue
```

Classify the result precisely:

- Binary works by absolute path but `agy` is absent: the terminal or agent host has a stale PATH. Use the absolute path or refresh PATH for this process; do not reinstall.
- Binary is absent: report that Antigravity CLI is not installed. Install only when the user or task authorization includes local CLI installation.
- Binary/command works but login is rejected: the CLI exists; request the user to authenticate. Do not request or handle credentials.
- CLI reports quota/rate limit: report the raw category to the user and ask for the next decision; do not describe it as an installation failure.

For an authorized new Windows installation, inspect the downloaded installer before executing it. Use a task-local filename, verify the installer hash for audit, and remove the local installer only after a successful run:

```powershell
$installerPath = Join-Path (Get-Location) 'install-antigravity-cli.cmd'
curl.exe -fsSL --connect-timeout 10 --max-time 60 `
  https://antigravity.google/cli/install.cmd -o $installerPath
Get-FileHash -LiteralPath $installerPath -Algorithm SHA256
Get-Content -LiteralPath $installerPath -Raw
& $installerPath
if ($LASTEXITCODE -eq 0) { Remove-Item -LiteralPath $installerPath }
```

The official installer places `agy.exe` in `%LOCALAPPDATA%\agy\bin` and updates the User PATH. A previously opened terminal may still need the preflight refresh above or a restart. Verify the installed CLI with `& $antigravityExe --version` before delegation.

## CLI Commands, Agent, and Execution Modes

Use these commands as live discovery rather than assuming the CLI state:

- `agy models`: list models available to the active account.
- `agy agents`: list specialists only when the user explicitly asks for one. Otherwise omit `--agent` and use the default Antigravity agent.
- `agy plugin list` (or `agy plugins list`): list imported plugins. Use its `install`, `uninstall`, `enable`, and `disable` commands only when the task authorizes plugin changes.
- `agy update`: update the CLI only with user authorization, then rerun preflight and `agy models`.
- `agy changelog`: inspect new/recent CLI behavior when a version change may affect the task.

Select execution mode deliberately:

- `--mode plan`: analysis and plan only; no source edits.
- `--mode accept-edits`: allow code/file edits within the approved task scope.
- `--model <model-id>` and `--agent <agent-id>`: use only identifiers validated from the live lists.
- `--add-dir <absolute-path>`: add only a user-approved auxiliary folder; state why it is needed in the brief.

Do not add `--effort` to orchestrated commands. Use the exact live model ID: `claude-opus-4-6-thinking`, `claude-sonnet-4-6`, or the Gemini High/Medium/Low identifier returned by `agy models`. Reasoning behavior is model-managed; do not invent an effort flag.

### Choose `-i` or `-p` deliberately

```powershell
agy
agy -i "Initial task brief"
agy -c
agy --conversation <CONVERSATION_ID>
agy -p "One bounded task" --print-timeout 20m
```

- Use `-i` for account/login actions, unclear requirements, high-risk changes, multi-wave execution with checkpoints, permission decisions, or live human steering. It opens an interactive conversation and waits for follow-up.
- Use `-p` for one bounded, fully specified task that can settle decisions without user input: read-only slash commands, scoped code review, a single implementation wave, deterministic verification, or E2E QC with a complete contract. It executes one turn, prints the result, and exits, making logs easy to capture.
- Use `-c` or `--conversation <ID>` for focused revisions when conversation continuity matters. Do not start a fresh broad prompt that loses prior findings.
- Never combine `-i` and `-p`. Do not use headless `-p` when the task may require account selection, credentials, production approval, or an unresolved product decision.
- In CLI 1.1.9+, print mode expands slash skills. Prefer `-p "/e2e-qc <brief>"` when that skill is installed and the QC contract is complete.
- In CLI 1.1.12+, `--mode` is honored in print mode. Use `--mode plan` for discovery only and `--mode accept-edits` only for approved local writes.

## File Permission Policy

When the brief authorizes an agent to read or write files in the named workspace or approved `--add-dir` folders, include `--dangerously-skip-permissions` in the command. This prevents repeated permission prompts during legitimate repository work.

Do not use that flag for a task that includes production mutation, deployment, data deletion, account changes, credential handling, or an unbounded directory. Those actions need interactive review and explicit user approval even if the agent can otherwise read/write source files.

Example for a scoped local edit:

```powershell
agy --mode accept-edits `
  --model <SELECTED_MODEL> `
  --dangerously-skip-permissions `
  -i "<approved brief with scope and acceptance criteria>"
```

## Run, Classify Errors, and Fall Back

Prefer Antigravity CLI for code or document production because its task, log, and agent state are terminal-visible. Use the IDE or `computer-use` only when the task needs visual inspection, a GUI-only feature, or browser interaction.

Give Antigravity the brief verbatim. Require it to report changed files, commands run, output locations, test results, assumptions, blockers, and unresolved risks. Keep it inside the nominated workspace and scope. Do not let it commit, push, deploy, mutate production, delete data, or change accounts unless the user explicitly authorizes that action.

Classify the exact stderr/stdout before retrying:

1. **High traffic / server overload:** retry the same command and model at most five total attempts, respecting a server-supplied retry delay or using a short increasing delay. Preserve artifacts between attempts. After attempt 5, switch once to the next model in the pre-approved fallback ladder. If no fallback was approved, ask the user.
2. **Any other model/run error:** do not blind-retry. Run `agy -p "/usage"`, inspect the raw error, and classify it as quota/rate-limit, authentication/account, permission/license, invalid flags/model, tool/MCP, or task failure. Apply only the matching remedy.
3. **Quota exhausted:** use the approved next model/pool. If every Antigravity pool is exhausted, stop Antigravity execution and use the in-scope Codex fallback when one is defined; never switch accounts without explicit user confirmation.
4. **Authentication/account:** open interactive `agy`/`agy -i` for the user to change account. Never request, read, copy, or enter credentials. After the user finishes, verify with one `/usage` call before resuming.
5. **Invalid command:** correct only the rejected flag or identifier and retry once; do not mislabel it as quota or installation failure.

The five-attempt limit applies only to high-traffic/overload errors. Do not spend five attempts on quota, authentication, permission, or deterministic task errors.
