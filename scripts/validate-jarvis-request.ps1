[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $RequestId,
  [string] $EventLog = "dashboards/task-events.jsonl",
  [string] $WorkRequestsRoot = "work-requests",
  [string[]] $AdditionalWorkRequestRoots = @("catbook/project-records/work-requests"),
  [string] $MemoryRoot = "memory",
  [switch] $Strict
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptRoot "..")
$eventLogPath = Join-Path $repoRoot $EventLog
$workRootPath = Join-Path $repoRoot $WorkRequestsRoot
$workRootPaths = @($workRootPath)
foreach ($root in @($AdditionalWorkRequestRoots)) {
  if ([string]::IsNullOrWhiteSpace($root)) { continue }
  if ([System.IO.Path]::IsPathRooted($root)) {
    $workRootPaths += $root
  } else {
    $workRootPaths += (Join-Path $repoRoot $root)
  }
}
$memoryRootPath = Join-Path $repoRoot $MemoryRoot

function Read-JsonLines([string] $Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return @() }
  $items = @()
  foreach ($line in Get-Content -Encoding UTF8 -LiteralPath $Path) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    try {
      $items += ($line | ConvertFrom-Json)
    } catch {
      $items += [pscustomobject]@{
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz")
        eventId = "EVT-PARSE-WARN"
        requestId = $RequestId
        agent = "Diagnostic Agent"
        status = "Review"
        task = "JSONL parse warning"
        detail = $line
        riskLevel = "Medium"
        channel = "diagnostic"
      }
    }
  }
  return @($items)
}

function Get-EventTime($Event) {
  try {
    return ([datetimeoffset]::Parse([string]$Event.timestamp)).UtcDateTime
  } catch {
    return [datetime]::MinValue
  }
}

function Test-AnyText($Events, [string] $Pattern) {
  foreach ($event in $Events) {
    $text = @($event.task, $event.detail, ($event.outputs -join " ")) -join " "
    if ($text -match $Pattern) { return $true }
  }
  return $false
}

function Test-FileLike([string] $Root, [string] $Filter) {
  if (-not (Test-Path -LiteralPath $Root)) { return $false }
  return @(
    Get-ChildItem -LiteralPath $Root -Recurse -File -Filter $Filter -ErrorAction SilentlyContinue
  ).Count -gt 0
}

function Find-WorkRequestFolder([string[]] $Roots, [string] $Id) {
  $matches = @()
  foreach ($root in @($Roots)) {
    if (-not (Test-Path -LiteralPath $root)) { continue }
    $matches += Get-ChildItem -LiteralPath $root -Directory |
      Where-Object { $_.Name -eq $Id -or $_.Name -like "*-$Id" }
  }
  return $matches |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
}

function New-Gate([string] $Id, [string] $Label, [bool] $Passed, [bool] $Required, [string] $Evidence) {
  [pscustomobject]@{
    id = $Id
    label = $Label
    passed = $Passed
    required = $Required
    evidence = $Evidence
  }
}

$events = Read-JsonLines $eventLogPath
$requestEvents = @($events | Where-Object { $_.requestId -eq $RequestId })
$ordered = @($requestEvents | Sort-Object { Get-EventTime $_ } -Descending)
$latest = $ordered | Select-Object -First 1
$workFolder = Find-WorkRequestFolder $workRootPaths $RequestId
$readmePath = if ($workFolder) { Join-Path $workFolder.FullName "README.md" } else { $null }
$readme = if ($readmePath -and (Test-Path -LiteralPath $readmePath)) { Get-Content -Encoding UTF8 -Raw -LiteralPath $readmePath } else { "" }

$hasIntake = $requestEvents.Count -gt 0
$hasHumanBrief = $readme.Contains("Human Brief") -or $readme.Contains("Human Brief Draft")
$hasStrategy = @($requestEvents | Where-Object { $_.agent -eq "Jarvis" -or $_.channel -eq "strategy" }).Count -gt 0
$hasDispatch = @($requestEvents | Where-Object { $_.agent -eq "Friday" -or $_.channel -eq "ops" }).Count -gt 0 -or $readme -match "Owner|To:|CC:|Agent Assignment"
$isWebProject = $readme -match "web|IA Brief|landing|Site Map|ia-brief|TASK-IA|TASK-WEB|Navigation Model"
$isMediumPlusWeb = (@($requestEvents | Where-Object { $_.riskLevel -in @("Medium", "High", "Critical") }).Count -gt 0) -and $isWebProject
$iaBriefInWorkFolder = $false
if ($workFolder) {
  $iaBriefInWorkFolder = (Test-Path -LiteralPath (Join-Path $workFolder.FullName "ia-brief.md")) -or
    (Test-Path -LiteralPath (Join-Path $workFolder.FullName "artifacts/ia-brief.md"))
}
$hasIADraft = ($iaBriefInWorkFolder) -or
  ($readme -match "IA Brief|Site Map|Navigation Model|ia-brief") -or
  (Test-AnyText $requestEvents "IA Brief|information architecture|ia-brief|Site Map")
$hasSpecializedDelegation = @($requestEvents | Where-Object {
  $_.PSObject.Properties["delegationType"] -and
  $_.delegationType -eq "specialized-agent-call"
}).Count -gt 0
$hasExecution = @($requestEvents | Where-Object {
  $_.channel -in @("implementation", "research", "design", "copy", "docs", "analysis") -or
  $_.agent -in @("TARS", "EVE", "Joi", "C3PO", "Data")
}).Count -gt 0
$highRisk = @($requestEvents | Where-Object { $_.riskLevel -in @("High", "Critical") }).Count -gt 0
$hasRiskReview = @($requestEvents | Where-Object {
  $_.agent -eq "KITT/TRON" -or $_.channel -eq "risk" -or
  ((@($_.task, $_.detail) -join " ") -match "Risk|security|privacy")
}).Count -gt 0
$hasVerification = Test-AnyText $requestEvents "verification|verify|verified|test|browser|pass|passed|evidence"
$hasDone = $latest -and $latest.status -eq "Done"
$hasWorkLog = (Test-FileLike (Join-Path $memoryRootPath "work-logs") "*$RequestId*.md") -or $readme -match "## Work Log"
$hasEpisodic = Test-FileLike (Join-Path $memoryRootPath "episodic") "*$RequestId*.md"

$gates = @(
  (New-Gate "intake" "Intake event" $hasIntake $true "task-events.jsonl requestId=$RequestId"),
  (New-Gate "human-brief" "Human Brief draft" $hasHumanBrief $false "work request README or brief"),
  (New-Gate "strategy" "Jarvis strategy" $hasStrategy $true "Jarvis or strategy channel event"),
  (New-Gate "dispatch" "Friday dispatch / To-CC" $hasDispatch $true "Friday event or assignment section"),
  (New-Gate "ia-draft" "IA Draft for Medium+ web projects" ($hasIADraft -or -not $isMediumPlusWeb) $isMediumPlusWeb "ia-brief.md, IA Brief section, or Joi IA/design event"),
  (New-Gate "specialized-delegation" "Specialized delegation for High/Critical risk" ($hasSpecializedDelegation -or -not $highRisk) $highRisk "delegationType=specialized-agent-call required for High/Critical risk"),
  (New-Gate "execution" "Agent execution" $hasExecution $true "implementation/research/design/copy/analysis event"),
  (New-Gate "risk-review" "Risk review" ($hasRiskReview -or -not $highRisk) $highRisk "required only for High/Critical risk"),
  (New-Gate "verification" "Verification evidence" $hasVerification $true "test/browser/evidence/detail output"),
  (New-Gate "work-log" "Work Log" $hasWorkLog $true "memory/work-logs or request README"),
  (New-Gate "episodic-memory" "Episodic Memory" $hasEpisodic $true "memory/episodic"),
  (New-Gate "done" "Done event" $hasDone $true "latest timestamp event status")
)

$blockingFailures = @($gates | Where-Object { $_.required -and -not $_.passed })
$result = [ordered]@{
  requestId = $RequestId
  status = if ($blockingFailures.Count -eq 0) { "Pass" } else { "Needs Work" }
  latestStatus = if ($latest) { $latest.status } else { "None" }
  eventCount = $requestEvents.Count
  workRequestFolder = if ($workFolder) { $workFolder.FullName } else { $null }
  gates = $gates
  blockingFailures = @($blockingFailures | ForEach-Object { $_.id })
}

$result | ConvertTo-Json -Depth 6

if ($Strict -and $blockingFailures.Count -gt 0) {
  exit 1
}
