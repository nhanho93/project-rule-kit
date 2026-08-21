[CmdletBinding()]
param(
    [ValidateSet("Antigravity", "Codex", "All")]
    [string]$Agent = "Antigravity",
    [string]$InstallRoot = (Join-Path $env:USERPROFILE ".browser-mcp-x-qc"),
    [switch]$InstallIfMissing
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$SkillRoot = Split-Path -Parent $PSScriptRoot
$AssetRoot = Join-Path $SkillRoot "assets"
$PackagePath = Join-Path $AssetRoot "browser-mcp-x-qc-portable.zip"
$HashPath = Join-Path $AssetRoot "browser-mcp-x-qc-portable.sha256"
$VersionPath = Join-Path $AssetRoot "browser-mcp-x-qc-portable.version"

function Test-JsonRelay($Entry, [string]$ExpectedRelay) {
    if (-not $Entry) { return $false }
    $argsProperty = $Entry.PSObject.Properties["args"]
    if (-not $argsProperty) { return $false }
    $args = @($argsProperty.Value)
    if ($args.Count -lt 1) { return $false }
    try {
        $actual = [System.IO.Path]::GetFullPath([string]$args[0])
        $expected = [System.IO.Path]::GetFullPath($ExpectedRelay)
        return $actual.Equals($expected, [System.StringComparison]::OrdinalIgnoreCase)
    }
    catch {
        return $false
    }
}

function Test-AntigravityConfig {
    $configPath = Join-Path $env:USERPROFILE ".gemini\config\mcp_config.json"
    if (-not (Test-Path -LiteralPath $configPath)) { return $false }
    try {
        $json = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json
        $containerProperty = $json.PSObject.Properties["mcpServers"]
        if (-not $containerProperty) { return $false }
        $currentProperty = $containerProperty.Value.PSObject.Properties["browser_qc_current"]
        $dedicatedProperty = $containerProperty.Value.PSObject.Properties["browser_qc_dedicated"]
        if ((-not $currentProperty) -or (-not $dedicatedProperty)) { return $false }
        $currentRelay = Join-Path $InstallRoot "runtime\current\relay.py"
        $dedicatedRelay = Join-Path $InstallRoot "runtime\dedicated\relay.py"
        return ((Test-JsonRelay $currentProperty.Value $currentRelay) -and
            (Test-JsonRelay $dedicatedProperty.Value $dedicatedRelay))
    }
    catch {
        Write-Warning "Antigravity MCP config is invalid: $configPath"
        return $false
    }
}

function Test-CodexConfig {
    $configPath = Join-Path $env:USERPROFILE ".codex\config.toml"
    if (-not (Test-Path -LiteralPath $configPath)) { return $false }
    $text = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8
    $hasCurrent = $text -match "(?m)^\[mcp_servers\.browser_qc_current\]$"
    $hasDedicated = $text -match "(?m)^\[mcp_servers\.browser_qc_dedicated\]$"
    $currentRelay = Join-Path $InstallRoot "runtime\current\relay.py"
    $dedicatedRelay = Join-Path $InstallRoot "runtime\dedicated\relay.py"
    $hasCurrentPath = $text -match [regex]::Escape($currentRelay)
    $hasDedicatedPath = $text -match [regex]::Escape($dedicatedRelay)
    return ($hasCurrent -and $hasDedicated -and $hasCurrentPath -and $hasDedicatedPath)
}

function Test-Runtime {
    $currentRelay = Join-Path $InstallRoot "runtime\current\relay.py"
    $dedicatedRelay = Join-Path $InstallRoot "runtime\dedicated\relay.py"
    return ((Test-Path -LiteralPath $currentRelay) -and (Test-Path -LiteralPath $dedicatedRelay))
}

function Get-InstalledVersion {
    $installedVersionPath = Join-Path $InstallRoot "VERSION"
    if (-not (Test-Path -LiteralPath $installedVersionPath)) { return $null }
    return (Get-Content -LiteralPath $installedVersionPath -Raw -Encoding UTF8).Trim()
}

function Test-VersionCurrent([string]$Installed, [string]$Packaged) {
    if ([string]::IsNullOrWhiteSpace($Installed)) { return $false }
    try {
        return ([version]$Installed -ge [version]$Packaged)
    }
    catch {
        return ($Installed -eq $Packaged)
    }
}

function Get-Status([string]$PackagedVersion) {
    $runtimeReady = Test-Runtime
    $installedVersion = Get-InstalledVersion
    $versionReady = Test-VersionCurrent $installedVersion $PackagedVersion
    $configReady = switch ($Agent) {
        "Antigravity" { Test-AntigravityConfig }
        "Codex" { Test-CodexConfig }
        "All" { (Test-AntigravityConfig) -and (Test-CodexConfig) }
    }
    return [pscustomobject]@{
        Agent = $Agent
        InstallRoot = $InstallRoot
        InstalledVersion = $installedVersion
        PackagedVersion = $PackagedVersion
        RuntimeReady = $runtimeReady
        ConfigReady = $configReady
        VersionReady = $versionReady
        Ready = ($runtimeReady -and $configReady -and $versionReady)
    }
}

function Assert-Package {
    foreach ($path in @($PackagePath, $HashPath, $VersionPath)) {
        if (-not (Test-Path -LiteralPath $path)) {
            throw "Bundled Browser MCP X asset is missing: $path"
        }
    }
    $expectedHash = (Get-Content -LiteralPath $HashPath -Raw -Encoding UTF8).Trim().ToUpperInvariant()
    if ($expectedHash -notmatch "^[A-F0-9]{64}$") {
        throw "Invalid SHA256 sidecar: $HashPath"
    }
    $actualHash = (Get-FileHash -LiteralPath $PackagePath -Algorithm SHA256).Hash.ToUpperInvariant()
    if ($actualHash -ne $expectedHash) {
        throw "Browser MCP X package checksum mismatch."
    }
}

function Install-Package {
    Assert-Package
    $tempBase = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd("\") + "\"
    $tempRoot = Join-Path $tempBase ("browser-mcp-x-skill-" + [guid]::NewGuid().ToString("N"))
    try {
        New-Item -ItemType Directory -Path $tempRoot | Out-Null
        Expand-Archive -LiteralPath $PackagePath -DestinationPath $tempRoot -Force
        $installer = Join-Path $tempRoot "Install.ps1"
        $selfTest = Join-Path $tempRoot "Self-Test.ps1"
        foreach ($path in @($installer, $selfTest)) {
            if (-not (Test-Path -LiteralPath $path)) {
                throw "Portable package is incomplete: $path"
            }
        }
        & $selfTest -BundleRoot $tempRoot
        if ($LASTEXITCODE -ne 0) { throw "Browser MCP X package self-test failed." }
        & $installer -Agent $Agent -InstallRoot $InstallRoot
        if ($LASTEXITCODE -ne 0) { throw "Browser MCP X installer failed." }
    }
    finally {
        $resolved = [System.IO.Path]::GetFullPath($tempRoot)
        $leaf = Split-Path -Leaf $resolved
        if ($resolved.StartsWith($tempBase, [System.StringComparison]::OrdinalIgnoreCase) -and
            $leaf.StartsWith("browser-mcp-x-skill-")) {
            Remove-Item -LiteralPath $resolved -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

try {
    if (-not (Test-Path -LiteralPath $VersionPath)) {
        throw "Bundled version sidecar is missing: $VersionPath"
    }
    $packagedVersion = (Get-Content -LiteralPath $VersionPath -Raw -Encoding UTF8).Trim()
    $status = Get-Status $packagedVersion
    if ($status.Ready) {
        Write-Output "[OK] Browser MCP X QC is installed and configured for $Agent."
        $status | ConvertTo-Json -Compress
        exit 0
    }

    Write-Output "[MISSING] Browser MCP X QC is not ready for $Agent."
    $status | ConvertTo-Json -Compress
    if (-not $InstallIfMissing) {
        Write-Output "[INFO] Re-run with -InstallIfMissing to install the bundled package."
        exit 2
    }

    Install-Package
    $verified = Get-Status $packagedVersion
    if (-not $verified.Ready) {
        throw "Installation completed but post-install verification failed."
    }
    Write-Output "[OK] Browser MCP X QC installed from the bundled package."
    Write-Output "RESTART_REQUIRED=true"
    $verified | ConvertTo-Json -Compress
    exit 0
}
catch {
    Write-Error $_
    exit 1
}
