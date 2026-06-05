[CmdletBinding()]
param(
  [int] $Port = 8000,
  [int] $MaxPort = 8020,
  [string] $BindAddress = "0.0.0.0",
  [switch] $ConfigureFirewall
)

$ErrorActionPreference = "Stop"

function Quote-ProcessArgument([string] $Value) {
  if ($Value -match '[\s"]') {
    return '"' + ($Value -replace '"', '\"') + '"'
  }
  return $Value
}

function Get-LocalIPv4Addresses {
  Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled = True" -ErrorAction SilentlyContinue |
    ForEach-Object { $_.IPAddress } |
    Where-Object {
      $_ -match '^\d{1,3}(\.\d{1,3}){3}$' -and
      $_ -notlike "127.*" -and
      $_ -notlike "169.254.*"
    } |
    Sort-Object -Unique
}

function Get-PythonCommand {
  $python = Get-Command python.exe -ErrorAction SilentlyContinue
  if (-not $python) {
    $python = Get-Command python -ErrorAction SilentlyContinue
  }
  if (-not $python) {
    throw "Python was not found on PATH."
  }
  return $python
}

function Get-ListeningProcessId([int] $TargetPort) {
  $lines = netstat -ano -p tcp | Select-String -Pattern "LISTENING" | Where-Object {
    [string] $_ -match "[:.]$TargetPort\s"
  }
  foreach ($line in $lines) {
    if ([string] $line -match '\s+(\d+)$') {
      return [int] $Matches[1]
    }
  }
  return $null
}

function Test-ManualServer([int] $TargetPort) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$TargetPort/docs/project-user-manual.html" -TimeoutSec 3
    return $response.StatusCode -eq 200 -and [string] $response.Headers["Content-Type"] -like "text/html*"
  } catch {
    return $false
  }
}

function Get-AvailableManualPort([int] $StartPort, [int] $EndPort) {
  for ($candidate = $StartPort; $candidate -le $EndPort; $candidate += 1) {
    $listeningPid = Get-ListeningProcessId $candidate
    if (-not $listeningPid) {
      return [pscustomobject]@{
        Port = $candidate
        ExistingPid = $null
        ServesManual = $false
      }
    }
    if (Test-ManualServer $candidate) {
      return [pscustomobject]@{
        Port = $candidate
        ExistingPid = $listeningPid
        ServesManual = $true
      }
    }
  }
  throw "No free port found from $StartPort to $EndPort."
}

function Ensure-ManualFirewallRule([int] $TargetPort) {
  $ruleName = "Jarvis Project User Manual LAN $TargetPort"
  try {
    $existingRule = & netsh advfirewall firewall show rule name="$ruleName" 2>&1
    if ($LASTEXITCODE -ne 0 -or ($existingRule -join "`n") -match "No rules match") {
      & netsh advfirewall firewall add rule name="$ruleName" dir=in action=allow protocol=TCP localport=$TargetPort profile=domain,private remoteip=localsubnet | Out-Null
      return [pscustomobject]@{
        Configured = $true
        Message = "Created inbound firewall rule '$ruleName' for Domain/Private profiles and LocalSubnet remote addresses."
      }
    }

    return [pscustomobject]@{
      Configured = $true
      Message = "Firewall rule '$ruleName' already exists."
    }
  } catch {
    return [pscustomobject]@{
      Configured = $false
      Message = "Firewall rule could not be created: $($_.Exception.Message)"
    }
  }
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptRoot "..")).Path
$serverScript = Join-Path $scriptRoot "project-user-manual-lan-server.py"
$manualPath = Join-Path $repoRoot "docs\project-user-manual.html"
$logDir = Join-Path $repoRoot "tmp"

if (-not (Test-Path -LiteralPath $manualPath)) {
  throw "Manual file not found: $manualPath"
}

if (-not (Test-Path -LiteralPath $serverScript)) {
  throw "Server script not found: $serverScript"
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$python = Get-PythonCommand
$portSelection = Get-AvailableManualPort $Port $MaxPort
$selectedPort = [int] $portSelection.Port
$stdoutLog = Join-Path $logDir "project-user-manual-lan-server-$selectedPort.out.log"
$stderrLog = Join-Path $logDir "project-user-manual-lan-server-$selectedPort.err.log"

$firewallConfigured = $false
$firewallMessage = "Firewall rule was not requested. If coworkers cannot connect, run this script from an elevated PowerShell with -ConfigureFirewall."
if ($ConfigureFirewall) {
  $firewallResult = Ensure-ManualFirewallRule $selectedPort
  $firewallConfigured = $firewallResult.Configured
  $firewallMessage = $firewallResult.Message
}

if ($portSelection.ExistingPid -and $portSelection.ServesManual) {
  $localUrls = @(
    "http://localhost:$selectedPort/docs/project-user-manual.html",
    "http://127.0.0.1:$selectedPort/docs/project-user-manual.html"
  )
  $lanUrls = @(Get-LocalIPv4Addresses | ForEach-Object { "http://$($_):$selectedPort/docs/project-user-manual.html" })
  [ordered]@{
    status = "already-running"
    requestedPort = $Port
    port = $selectedPort
    bindAddress = $BindAddress
    pid = $portSelection.ExistingPid
    localUrls = $localUrls
    lanUrls = $lanUrls
    firewallConfigured = $firewallConfigured
    firewallMessage = $firewallMessage
    stdoutLog = $stdoutLog
    stderrLog = $stderrLog
  } | ConvertTo-Json -Depth 4
  exit 0
}

$processArgs = @(
  $serverScript,
  "--host",
  $BindAddress,
  "--port",
  [string] $selectedPort,
  "--root",
  $repoRoot
)
$argumentString = ($processArgs | ForEach-Object { Quote-ProcessArgument $_ }) -join " "

$process = Start-Process `
  -FilePath $python.Source `
  -ArgumentList $argumentString `
  -WorkingDirectory $repoRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog `
  -PassThru

Start-Sleep -Seconds 1

if (-not (Get-ListeningProcessId $selectedPort) -or -not (Test-ManualServer $selectedPort)) {
  throw "Manual server did not start. Check $stderrLog"
}

$localUrls = @(
  "http://localhost:$selectedPort/docs/project-user-manual.html",
  "http://127.0.0.1:$selectedPort/docs/project-user-manual.html"
)
$lanUrls = @(Get-LocalIPv4Addresses | ForEach-Object { "http://$($_):$selectedPort/docs/project-user-manual.html" })

[ordered]@{
  status = "started"
  requestedPort = $Port
  port = $selectedPort
  bindAddress = $BindAddress
  pid = $process.Id
  localUrls = $localUrls
  lanUrls = $lanUrls
  firewallConfigured = $firewallConfigured
  firewallMessage = $firewallMessage
  stdoutLog = $stdoutLog
  stderrLog = $stderrLog
} | ConvertTo-Json -Depth 4
