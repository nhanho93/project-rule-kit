---
name: powershell-windows
description: Use when writing or reviewing PowerShell, Windows shell commands, filesystem automation, or Windows-specific scripts.
---

# Powershell Windows

Write PowerShell with object-pipeline semantics, literal path safety and explicit
process exit handling. Preserve quoting and filesystem boundaries on Windows.

## When to Use

Use for PowerShell, Windows process/filesystem automation, registry/services or
Windows-specific CI. Confirm PowerShell edition, execution policy, working
directory and command availability first.

Do not translate Bash syntax mechanically. Do not build destructive paths from
unvalidated strings, globs or cross-shell output.

## Workflow

1. Use cmdlets and objects rather than parsing display text where possible.
2. Pass filesystem targets with `-LiteralPath`; resolve and verify recursive
   delete/move targets remain inside the intended directory.
3. Quote native executable arguments deliberately and inspect `$LASTEXITCODE`;
   `$?` alone does not preserve every native failure.
4. Set `$ErrorActionPreference` or per-command `-ErrorAction Stop` where a
   failure must abort, and use `try/finally` for cleanup.
5. Avoid repurposing system variables and avoid exposing secrets in command
   lines, transcripts or child-process arguments.
6. Test paths with spaces, empty collections, nonzero native exits and repeat
   execution before delivery.

## Limitations and Stop Conditions

- Windows PowerShell and PowerShell 7 differ in encoding and native invocation.
- Remote/session policy may override local assumptions.
- Stop before destructive action when the resolved absolute target, recovery
  path or authorization is unclear.

## Example

```powershell
$result = & node .\scripts\check.mjs
if ($LASTEXITCODE -ne 0) { throw "validator failed" }
Get-Item -LiteralPath $target | Select-Object FullName
```

Completion requires edition-aware commands, checked exit codes, bounded paths,
repeatable behavior and cleanup/error evidence.
