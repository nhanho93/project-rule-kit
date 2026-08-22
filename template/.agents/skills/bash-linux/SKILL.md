---
name: bash-linux
description: Use when writing or reviewing Bash, Linux shell commands, scripts, process management, or Unix filesystem operations.
---

# Bash Linux

Write Bash with explicit failure, quoting, input and filesystem boundaries for
the declared shell and operating environment.

## When to Use

Use for Bash/Linux scripts, process commands and Unix filesystem automation.
Confirm shell version, working directory, user, available utilities and project
procedure before relying on flags or extensions.

Do not pass untrusted strings through `eval`, construct destructive commands
from unresolved globs, or assume a pipeline fails when only an early stage did.

## Workflow

1. Use `set -euo pipefail` only after checking expected nonzero branches; handle
   those branches explicitly rather than masking them with blanket `|| true`.
2. Quote expansions, use arrays for argument lists and delimit option parsing
   with `--` where supported.
3. Resolve and verify destructive targets; avoid `/`, home directories, broad
   workspace roots and empty-variable paths.
4. Use `trap` for temporary cleanup and preserve the original exit status.
5. Bound network calls with connection/total timeouts and validate downloaded
   artifacts before execution.
6. Test spaces, empty input, failed pipeline stages, repeated execution and
   interrupted cleanup.

## Limitations and Stop Conditions

- Bash, POSIX `sh` and vendor utilities have different syntax/flags.
- `set -e` behavior changes across conditions, functions and subshells.
- Stop when target path, privilege, recovery or shell compatibility is unclear.

## Example

```bash
tmp_dir="$(mktemp -d)"
trap 'status=$?; rm -rf -- "$tmp_dir"; exit $status' EXIT
curl --connect-timeout 10 --max-time 60 --fail --location "$url" -o "$tmp_dir/item"
```

Completion requires checked exits, quoted/bounded inputs, safe cleanup,
idempotency where needed and raw command evidence.
