[CmdletBinding()]
param(
  [int] $Port = 8787,
  [int] $MaxPort = 8797,
  [string] $BindAddress = "127.0.0.1",
  [switch] $StrictPort,
  [switch] $NoJson
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptRoot "..")
$dashboardPath = "dashboards/agent-assignment-dashboard.html"
$urlHost = if ($BindAddress -eq "0.0.0.0") { "127.0.0.1" } else { $BindAddress }
$tmpDir = Join-Path $repoRoot "tmp"

if (-not (Test-Path -LiteralPath $tmpDir)) {
  New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
}

function Get-PythonSpec {
  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($python) {
    return [pscustomobject]@{ File = $python.Source; Args = @() }
  }

  $py = Get-Command py -ErrorAction SilentlyContinue
  if ($py) {
    return [pscustomobject]@{ File = $py.Source; Args = @("-3") }
  }

  throw "Python is required to serve the dashboard. Install Python or start an equivalent static server at the project root."
}

function Test-PortListening([int] $CandidatePort) {
  try {
    return @(
      Get-NetTCPConnection -LocalPort $CandidatePort -State Listen -ErrorAction Stop
    ).Count -gt 0
  } catch {
    return $false
  }
}

function Test-DashboardUrl([string] $Url) {
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -eq 200 -and $response.Content -match "Jarvis|Virtual Office|agent-assignment-dashboard"
  } catch {
    return $false
  }
}

$selectedPort = $null
$selectedUrl = $null
$status = "unstarted"
$processId = $null
$serverLog = $null
$serverErrorLog = $null

for ($candidate = $Port; $candidate -le $MaxPort; $candidate++) {
  $candidateUrl = "http://$urlHost`:$candidate/$dashboardPath"

  if (Test-PortListening $candidate) {
    if (Test-DashboardUrl $candidateUrl) {
      $selectedPort = $candidate
      $selectedUrl = $candidateUrl
      $status = "reused"
      break
    }

    if ($StrictPort) {
      throw "Port $candidate is already in use by another service. Stop that service or choose a different port."
    }

    continue
  }

  $python = Get-PythonSpec
  $serverLog = Join-Path $tmpDir "dashboard-server-$candidate.out.log"
  $serverErrorLog = Join-Path $tmpDir "dashboard-server-$candidate.err.log"
  $arguments = @($python.Args) + @("-m", "http.server", [string] $candidate, "--bind", $BindAddress)

  $process = Start-Process `
    -FilePath $python.File `
    -ArgumentList $arguments `
    -WorkingDirectory $repoRoot `
    -WindowStyle Hidden `
    -PassThru `
    -RedirectStandardOutput $serverLog `
    -RedirectStandardError $serverErrorLog

  for ($attempt = 0; $attempt -lt 24; $attempt++) {
    Start-Sleep -Milliseconds 250
    if (Test-DashboardUrl $candidateUrl) {
      $selectedPort = $candidate
      $selectedUrl = $candidateUrl
      $status = "started"
      $processId = $process.Id
      break
    }
  }

  if ($selectedPort) {
    break
  }

  if (-not $process.HasExited) {
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
  }

  if ($StrictPort) {
    throw "Dashboard server did not become ready on port $candidate. See $serverErrorLog."
  }
}

if (-not $selectedPort) {
  throw "No available dashboard port found in range $Port-$MaxPort."
}

$result = [ordered]@{
  status = $status
  url = $selectedUrl
  port = $selectedPort
  bindAddress = $BindAddress
  processId = $processId
  projectRoot = $repoRoot.Path
  dashboardPath = $dashboardPath
  serverLog = $serverLog
  serverErrorLog = $serverErrorLog
  aiToolBrowserInstruction = "Open url with the active AI tool browser or preview surface, such as Codex Browser iab, Cursor browser, Antigravity browser, or VS Code Simple Browser/Webview. Do not use the OS default browser as the primary path."
  fallbackInstruction = "If the active AI tool has no callable browser, keep the server running and show this url to the user."
}

if ($NoJson) {
  Write-Host "Dashboard $status at $selectedUrl"
  Write-Host $result.aiToolBrowserInstruction
} else {
  $result | ConvertTo-Json -Depth 4
}
