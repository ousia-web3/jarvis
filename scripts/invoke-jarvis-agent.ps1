[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $RequestId,

  [Parameter(Mandatory = $true)]
  [string] $Agent,

  [Parameter(Mandatory = $true)]
  [string] $Task,

  [string] $Role = "",
  [ValidateSet("To", "CC", "Standby")]
  [string] $Assignment = "To",
  [ValidateSet("Todo", "In Progress", "Review", "Blocked", "Done")]
  [string] $Status = "In Progress",
  [ValidateSet("Low", "Medium", "High", "Critical")]
  [string] $RiskLevel = "Low",
  [string] $Channel = "ops",
  [string] $Skill = "",
  [string] $Detail = "",
  [string[]] $Cc = @(),
  [string[]] $Outputs = @(),
  [string] $EventLog = "dashboards/task-events.jsonl"
)

$ErrorActionPreference = "Stop"

function Convert-PathForJson([string] $Path) {
  return $Path.Replace("\", "/")
}

function Expand-CommaList([string[]] $Items) {
  $expanded = @()
  foreach ($item in @($Items)) {
    if (-not $item) { continue }
    foreach ($part in ($item -split ",")) {
      $trimmed = $part.Trim()
      if ($trimmed) { $expanded += $trimmed }
    }
  }
  return @($expanded)
}

function Add-JsonLineWithRetry([string] $Path, [string] $Value) {
  $lastError = $null
  for ($attempt = 1; $attempt -le 5; $attempt += 1) {
    try {
      Add-Content -LiteralPath $Path -Encoding UTF8 -Value $Value
      return
    } catch {
      $lastError = $_
      Start-Sleep -Milliseconds (100 * $attempt)
    }
  }
  throw $lastError
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRootInfo = Resolve-Path (Join-Path $scriptRoot "..")
$repoRoot = $repoRootInfo.Path
$eventLogPath = Join-Path $repoRoot $EventLog
$eventLogParent = Split-Path -Parent $eventLogPath

if (-not (Test-Path -LiteralPath $eventLogParent)) {
  New-Item -ItemType Directory -Force -Path $eventLogParent | Out-Null
}

if (-not $Role) {
  $Role = switch ($Agent) {
    "Jarvis" { "Strategy" }
    "Friday" { "Operations" }
    "EVE" { "Research" }
    "Joi" { "Design" }
    "TARS" { "Engineering" }
    "C3PO" { "Communications" }
    "Data" { "Analysis" }
    "KITT/TRON" { "Risk Shield" }
    "Diagnostic Agent" { "Diagnostics" }
    default { "Specialized Agent" }
  }
}

if (-not $Detail) {
  if ($Skill) {
    $Detail = "Specialized skill call: $Skill"
  } else {
    $Detail = "Specialized agent call"
  }
}

$timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz"
$eventId = "EVT-AGENT-CALL-" + (Get-Date -Format "yyyyMMddHHmmssfff") + "-" + (Get-Random -Minimum 1000 -Maximum 9999)
$normalizedOutputs = @(Expand-CommaList $Outputs | ForEach-Object { Convert-PathForJson $_ })
$normalizedCc = @(Expand-CommaList $Cc)

$event = [ordered]@{
  timestamp = $timestamp
  eventId = $eventId
  requestId = $RequestId
  agent = $Agent
  role = $Role
  assignment = $Assignment
  status = $Status
  task = $Task
  detail = $Detail
  riskLevel = $RiskLevel
  outputs = $normalizedOutputs
  channel = $Channel
  skill = $Skill
  cc = $normalizedCc
  delegationType = "specialized-agent-call"
}

Add-JsonLineWithRetry $eventLogPath ($event | ConvertTo-Json -Compress -Depth 5)

[ordered]@{
  requestId = $RequestId
  eventId = $eventId
  agent = $Agent
  skill = $Skill
  status = $Status
  eventLog = Convert-PathForJson ($eventLogPath.Substring($repoRoot.Length + 1))
} | ConvertTo-Json -Depth 4
