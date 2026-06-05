[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $RequestId,
  [string] $Task = "Jarvis request completed",
  [string] $Detail = "Request closed by close-jarvis-request.ps1.",
  [string] $Agent = "TARS",
  [string] $Role = "Engineering",
  [string[]] $Outputs,
  [string] $RiskLevel,
  [switch] $NoValidate
)

$ErrorActionPreference = "Stop"

function Convert-JsonText([string] $Value) {
  return $Value | ConvertFrom-Json
}

function Normalize-EventDetail([string] $Value) {
  if (-not $Value) {
    return $Value
  }
  $normalized = $Value.Trim()
  $empty = Convert-JsonText '"\uc5c6\uc74c"'
  $done = Convert-JsonText '"\ub428"'
  $is = Convert-JsonText '"\uc784"'
  $rules = @(
    @{ Ending = Convert-JsonText '"\uc5c6\uc5c8\uc2b5\ub2c8\ub2e4"'; Replacement = $empty },
    @{ Ending = Convert-JsonText '"\uc5c6\uc5c8\ub2e4"'; Replacement = $empty },
    @{ Ending = Convert-JsonText '"\uc5c6\ub2e4"'; Replacement = $empty },
    @{ Ending = Convert-JsonText '"\ub429\ub2c8\ub2e4"'; Replacement = $done },
    @{ Ending = Convert-JsonText '"\ub41c\ub2e4"'; Replacement = $done },
    @{ Ending = Convert-JsonText '"\uc785\ub2c8\ub2e4"'; Replacement = $is },
    @{ Ending = Convert-JsonText '"\ud588\uc2b5\ub2c8\ub2e4"'; Replacement = "" },
    @{ Ending = Convert-JsonText '"\ud558\uc600\uc2b5\ub2c8\ub2e4"'; Replacement = "" },
    @{ Ending = Convert-JsonText '"\ud558\uc600\ub2e4"'; Replacement = "" },
    @{ Ending = Convert-JsonText '"\ud588\ub2e4"'; Replacement = "" },
    @{ Ending = Convert-JsonText '"\ud569\ub2c8\ub2e4"'; Replacement = "" },
    @{ Ending = Convert-JsonText '"\ud55c\ub2e4"'; Replacement = "" }
  )
  foreach ($rule in $rules) {
    $normalized = $normalized -replace ([regex]::Escape($rule.Ending) + '\.\s*'), ($rule.Replacement + ", ")
    $normalized = $normalized -replace ([regex]::Escape($rule.Ending) + '\.?$'), $rule.Replacement
  }
  $normalized = $normalized -replace '\.$', ''
  $normalized = $normalized -replace ',\s*$', ''
  return $normalized.Trim()
}

if (-not $Outputs -or $Outputs.Count -eq 0) {
  $Outputs = @("dashboards/task-events.jsonl")
}
if (-not $RiskLevel) {
  $RiskLevel = "Low"
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRootInfo = Resolve-Path (Join-Path $scriptRoot "..")
$repoRoot = $repoRootInfo.Path
$eventLog = Join-Path $repoRoot "dashboards/task-events.jsonl"
$workRoot = Join-Path $repoRoot "work-requests"
$memoryRoot = Join-Path $repoRoot "memory"
$workLogs = Join-Path $memoryRoot "work-logs"
$episodic = Join-Path $memoryRoot "episodic"
$date = Get-Date -Format "yyyy-MM-dd"

foreach ($path in @($workRoot, $memoryRoot, $workLogs, $episodic)) {
  if (-not (Test-Path -LiteralPath $path)) {
    New-Item -ItemType Directory -Force -Path $path | Out-Null
  }
}

$workFolder = Get-ChildItem -LiteralPath $workRoot -Directory |
  Where-Object { $_.Name -eq $RequestId -or $_.Name -like "*-$RequestId" } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $workFolder) {
  $workFolderPath = Join-Path $workRoot "$date-$RequestId"
  New-Item -ItemType Directory -Force -Path $workFolderPath | Out-Null
  $workFolder = Get-Item -LiteralPath $workFolderPath
}

$relativeOutputs = @($Outputs)
$workLogPath = Join-Path $workLogs "$date-$RequestId.md"
if (-not (Test-Path -LiteralPath $workLogPath)) {
  $lines = @(
    "# Work Log: $RequestId",
    "",
    "## Metadata",
    "",
    "- Task ID: $RequestId",
    "- Project: Jarvis",
    "- Agent: $Agent",
    "- Role: $Role",
    "- Finished At: $(Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz")",
    "- Status: Done",
    "",
    "## Input",
    "",
    "- Request Summary: $Task",
    "- Constraints: no external release, no sensitive data, no destructive cleanup",
    "",
    "## Execution",
    "",
    "- Work Performed: $Detail",
    "- Tools: Jarvis request lifecycle scripts",
    "- Key Judgment: Done requires gates, evidence, and memory records.",
    "",
    "## Output",
    ""
  )
  foreach ($output in $relativeOutputs) { $lines += "- $output" }
  $lines += @(
    "",
    "## Risk",
    "",
    "- Risk Level: $RiskLevel",
    "- Escalation: not required unless validation reports blockers",
    "",
    "## Next",
    "",
    "- Re-run validate-jarvis-request.ps1 when needed."
  )
  Set-Content -Encoding UTF8 -LiteralPath $workLogPath -Value $lines
}

$episodicPath = Join-Path $episodic "$date-$RequestId.md"
if (-not (Test-Path -LiteralPath $episodicPath)) {
  $lines = @(
    "# Episodic Memory: $RequestId",
    "",
    "## Basic",
    "",
    "- Date: $date",
    "- Agent: $Agent",
    "- Project: Jarvis",
    "- Task ID: $RequestId",
    "",
    "## Diary",
    "",
    "- Assigned Work: $Task",
    "- Actual Work: $Detail",
    "- Difficult Point: converting documented rules into enforceable lifecycle gates",
    "- Judgment Shift: request closure must include evidence and memory, not only a Done event",
    "- Human Feedback: raise philosophy, docs, and execution system toward product-grade operation",
    "",
    "## Learning",
    "",
    "- New Learning: close and validate hooks matter as much as start hooks.",
    "- Avoid Next Time: do not close meaningful work without Work Log and Episodic Memory.",
    "- Reusable Pattern: close script creates memory drafts and a Done event together.",
    "- Wisdom Candidate: product-grade agent operation requires lifecycle gates.",
    "",
    "## Memory Policy",
    "",
    "- Retain: lifecycle gates, validation results, final docs",
    "- Summarize/Purge: temporary browser and server noise",
    "- Sensitive Review Needed: none"
  )
  Set-Content -Encoding UTF8 -LiteralPath $episodicPath -Value $lines
}

$workLogRelative = $workLogPath.Substring($repoRoot.Length + 1).Replace("\", "/")
$episodicRelative = $episodicPath.Substring($repoRoot.Length + 1).Replace("\", "/")

$timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz"
$eventId = "EVT-AUTO-" + (Get-Date -Format "yyyyMMddHHmmssfff")
$event = [ordered]@{
  timestamp = $timestamp
  eventId = $eventId
  requestId = $RequestId
  agent = $Agent
  role = $Role
  assignment = "To"
  status = "Done"
  task = $Task
  detail = Normalize-EventDetail $Detail
  riskLevel = $RiskLevel
  outputs = @($relativeOutputs + @($workLogRelative, $episodicRelative))
  channel = "implementation"
}

Add-Content -LiteralPath $eventLog -Encoding UTF8 -Value ($event | ConvertTo-Json -Compress -Depth 5)

$validation = $null
if (-not $NoValidate) {
  $validation = & (Join-Path $scriptRoot "validate-jarvis-request.ps1") -RequestId $RequestId | ConvertFrom-Json
}

[ordered]@{
  requestId = $RequestId
  eventId = $eventId
  status = "closed"
  workRequestFolder = $workFolder.FullName
  workLog = $workLogPath
  episodicMemory = $episodicPath
  validationStatus = if ($validation) { $validation.status } else { "skipped" }
  blockingFailures = if ($validation) { $validation.blockingFailures } else { @() }
} | ConvertTo-Json -Depth 5
