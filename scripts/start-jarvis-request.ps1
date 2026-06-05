[CmdletBinding()]
param(
  [string] $RequestId = "jarvis-work-request",
  [string] $Task = "__JARVIS_DEFAULT_TASK__",
  [string] $Detail = "__JARVIS_DEFAULT_DETAIL__",
  [int] $Port = 8787,
  [int] $MaxPort = 8797,
  [string] $BindAddress = "127.0.0.1",
  [switch] $NoEvent
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

if ($Task -eq "__JARVIS_DEFAULT_TASK__") {
  $Task = Convert-JsonText '"IDE \uc791\uc5c5 \uc694\uccad \uc811\uc218"'
}

if ($Detail -eq "__JARVIS_DEFAULT_DETAIL__") {
  $Detail = Convert-JsonText '"\uc0c8 IDE \uc791\uc5c5 \uc694\uccad\uc6a9 \ub85c\uceec Jarvis \ub300\uc2dc\ubcf4\ub4dc \uc900\ube44"'
}

$Detail = Normalize-EventDetail $Detail

$roleStrategy = Convert-JsonText '"\uc804\ub7b5 \uc9c0\ud718"'
$outputDashboardStart = Convert-JsonText '"\ub300\uc2dc\ubcf4\ub4dc \uc790\ub3d9 \uc2dc\uc791"'
$outputAiToolBrowserOpen = Convert-JsonText '"AI\ud234 \ube0c\ub77c\uc6b0\uc800 \uc5f4\uae30"'
$outputReopenFromDone = Convert-JsonText '"\uc644\ub8cc \uc694\uccad \uc7ac\uc9c4\ud589"'
$reopenFromDoneDetail = Convert-JsonText '"\uc644\ub8cc\ub41c \uc694\uccad\uc5d0 \ucd94\uac00 \uc791\uc5c5\uc774 \uc811\uc218\ub418\uc5b4 \uc9c4\ud589 \uc0c1\ud0dc\ub85c \uc7ac\uac1c"'

function Get-EventTime([object] $Event) {
  $parsed = [DateTimeOffset]::MinValue
  if ([DateTimeOffset]::TryParse([string] $Event.timestamp, [ref] $parsed)) {
    return $parsed
  }
  return [DateTimeOffset]::MinValue
}

function Get-LatestRequestEvent([string] $Path, [string] $TargetRequestId) {
  if (-not $TargetRequestId -or -not (Test-Path -LiteralPath $Path)) {
    return $null
  }

  $latest = $null
  $latestTime = [DateTimeOffset]::MinValue
  $latestIndex = -1
  $index = 0

  foreach ($line in (Get-Content -LiteralPath $Path -Encoding UTF8)) {
    if (-not $line -or -not $line.Trim()) {
      $index += 1
      continue
    }

    try {
      $event = $line | ConvertFrom-Json
    } catch {
      $index += 1
      continue
    }

    if ($event.requestId -eq $TargetRequestId) {
      $eventTime = Get-EventTime $event
      if (
        -not $latest -or
        $eventTime -gt $latestTime -or
        ($eventTime -eq $latestTime -and $index -gt $latestIndex)
      ) {
        $latest = $event
        $latestTime = $eventTime
        $latestIndex = $index
      }
    }

    $index += 1
  }

  if (-not $latest) {
    return $null
  }

  return [pscustomobject]@{
    Event = $latest
    Timestamp = $latestTime
    AppendIndex = $latestIndex
  }
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptRoot "..")
$dashboardScript = Join-Path $scriptRoot "start-dashboard.ps1"
$eventLog = Join-Path $repoRoot "dashboards/task-events.jsonl"

$dashboardJson = & $dashboardScript -Port $Port -MaxPort $MaxPort -BindAddress $BindAddress
$dashboard = $dashboardJson | ConvertFrom-Json
$previousLatest = Get-LatestRequestEvent $eventLog $RequestId
$previousStatus = if ($previousLatest) { [string] $previousLatest.Event.status } else { $null }
$reopenedFromDone = $previousStatus -eq "Done"

if (-not $NoEvent) {
  $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz"
  $eventId = "EVT-AUTO-" + (Get-Date -Format "yyyyMMddHHmmssfff")
  $outputs = @($outputDashboardStart, $outputAiToolBrowserOpen)
  if ($reopenedFromDone) {
    $outputs += $outputReopenFromDone
    $Detail = if ($Detail) { "$reopenFromDoneDetail; $Detail" } else { $reopenFromDoneDetail }
  }
  $event = [ordered]@{
    timestamp = $timestamp;
    eventId = $eventId;
    requestId = $RequestId;
    agent = "Jarvis";
    role = $roleStrategy;
    assignment = "To";
    status = "In Progress";
    task = $Task;
    detail = $Detail;
    riskLevel = "Low";
    outputs = $outputs;
    channel = "strategy";
  }

  $eventJson = $event | ConvertTo-Json -Compress -Depth 4
  Add-Content -LiteralPath $eventLog -Value $eventJson -Encoding UTF8
}

[ordered]@{
  status = $dashboard.status;
  url = $dashboard.url;
  port = $dashboard.port;
  requestId = $RequestId;
  eventWritten = -not $NoEvent;
  previousStatus = $previousStatus;
  reopenedFromDone = $reopenedFromDone;
  aiToolBrowserInstruction = $dashboard.aiToolBrowserInstruction;
  fallbackInstruction = $dashboard.fallbackInstruction;
} | ConvertTo-Json -Depth 4
