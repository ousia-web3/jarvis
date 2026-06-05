[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $RequestId,

  [Parameter(Mandatory = $true)]
  [string] $Goal,

  [string[]] $Task = @(),
  [string] $WorkRequestsRoot = "work-requests",
  [int] $MaxParallel = 4,
  [switch] $Force,
  [switch] $NoEvent
)

$ErrorActionPreference = "Stop"

function Convert-PathForJson([string] $Path) {
  return $Path.Replace("\", "/")
}

function Find-OrCreateWorkRequestFolder([string] $Root, [string] $Id) {
  $date = Get-Date -Format "yyyy-MM-dd"
  if (-not (Test-Path -LiteralPath $Root)) {
    New-Item -ItemType Directory -Force -Path $Root | Out-Null
  }

  $folder = Get-ChildItem -LiteralPath $Root -Directory |
    Where-Object { $_.Name -eq $Id -or $_.Name -like "*-$Id" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if ($folder) {
    return $folder.FullName
  }

  $folderPath = Join-Path $Root "$date-$Id"
  New-Item -ItemType Directory -Force -Path $folderPath | Out-Null
  return (Resolve-Path $folderPath).Path
}

function Add-WorkflowEvent(
  [string] $EventLog,
  [string] $WorkflowId,
  [string] $Stage,
  [string] $Agent,
  [string] $Role,
  [string] $TaskTitle,
  [string[]] $Outputs
) {
  $event = [ordered]@{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz"
    eventId = "EVT-DWF-" + (Get-Date -Format "yyyyMMddHHmmssfff")
    requestId = $RequestId
    agent = $Agent
    role = $Role
    assignment = "To"
    status = "Done"
    task = $TaskTitle
    detail = "Dynamic Workflow $Stage generated"
    riskLevel = "Medium"
    outputs = @($Outputs | ForEach-Object { Convert-PathForJson $_ })
    channel = "ops"
    skill = "dynamic-workflow"
    delegationType = "dynamic-workflow"
    workflowId = $WorkflowId
    workflowStage = $Stage
    dynamicLevel = "L4"
  }

  Add-Content -LiteralPath $EventLog -Encoding UTF8 -Value ($event | ConvertTo-Json -Compress -Depth 6)
}

function Expand-TaskList([string[]] $Items) {
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

$Task = @(Expand-TaskList $Task)

if ($Task.Count -eq 0) {
  $Task = @(
    "Define request boundary",
    "Create core deliverable",
    "Run independent verification",
    "Aggregate final report"
  )
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptRoot "..")).Path
$workRoot = Join-Path $repoRoot $WorkRequestsRoot
$workFolder = Find-OrCreateWorkRequestFolder $workRoot $RequestId
$workflowDir = Join-Path $workFolder "dynamic-workflow"

if ((Test-Path -LiteralPath $workflowDir) -and -not $Force) {
  throw "Dynamic workflow already exists: $workflowDir. Use -Force to overwrite generated files."
}

foreach ($path in @(
  $workflowDir,
  (Join-Path $workflowDir "packets"),
  (Join-Path $workflowDir "results"),
  (Join-Path $workflowDir "verification"),
  (Join-Path $workflowDir "fixes"),
  (Join-Path $workflowDir "aggregation")
)) {
  New-Item -ItemType Directory -Force -Path $path | Out-Null
}

$workflowId = "DWF-$RequestId"
$createdAt = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz"
$taskItems = @()
$workers = @()
$index = 1

foreach ($taskTitle in $Task) {
  $taskId = "task-{0:000}" -f $index
  $contextPath = "packets/$taskId.context.md"
  $resultPath = "results/$taskId.result.json"
  $packetPath = Join-Path $workflowDir $contextPath

  $packet = @(
    "# Context Packet: $taskId",
    "",
    "## Request",
    "",
    "- Request ID: $RequestId",
    "- Workflow ID: $workflowId",
    "- Goal: $Goal",
    "",
    "## Task",
    "",
    "- Task ID: $taskId",
    "- Title: $taskTitle",
    "- Owner Agent: TARS",
    "- Worker Type: Implementer",
    "",
    "## Context Boundary",
    "",
    "- Add only the context needed for this task.",
    "- Do not include secrets, personal data, account data, or external transfer targets.",
    "- Write the result to `$resultPath`.",
    "",
    "## Expected Outputs",
    "",
    "- None by default. Add paths to `expectedOutputs` in `task-graph.json` when needed."
  )
  Set-Content -LiteralPath $packetPath -Encoding UTF8 -Value $packet

  $taskItems += [ordered]@{
    taskId = $taskId
    title = $taskTitle
    stage = "implement"
    ownerAgent = "TARS"
    workerType = "Implementer"
    dependencies = @()
    contextPacket = $contextPath
    expectedOutputs = @()
    command = ""
    fixerCommand = ""
    status = "Ready"
  }

  $workers += [ordered]@{
    workerId = "worker-$taskId"
    taskId = $taskId
    workerType = "Implementer"
    agent = "TARS"
    status = "Ready"
    inputContext = $contextPath
    resultPath = $resultPath
    command = ""
    allowExternalCommand = $false
  }

  $index += 1
}

$taskGraph = [ordered]@{
  workflowId = $workflowId
  workflowVersion = "1.0"
  dynamicLevel = "L4"
  mode = "local-dynamic-workflow"
  requestId = $RequestId
  goal = $Goal
  createdAt = $createdAt
  planner = [ordered]@{
    agent = "Jarvis"
    role = "Master Planner / Aggregator"
  }
  taskManager = [ordered]@{
    agent = "Friday"
    role = "Task Graph Manager"
  }
  tasks = $taskItems
  verification = [ordered]@{
    leadAgent = "Data"
    riskAgent = "KITT/TRON"
    diagnosticAgent = "Diagnostic Agent"
    policy = "Verify worker results and expectedOutputs independently."
  }
  aggregation = [ordered]@{
    agent = "Jarvis"
    report = "aggregation/aggregate-report.md"
  }
}

$manifest = [ordered]@{
  workflowId = $workflowId
  requestId = $RequestId
  createdAt = $createdAt
  maxParallel = $MaxParallel
  workers = $workers
  verifiers = @(
    [ordered]@{
      workerId = "verifier-data"
      workerType = "Verifier"
      agent = "Data"
      status = "Ready"
      resultPath = "verification/verification-report.json"
    },
    [ordered]@{
      workerId = "verifier-diagnostic"
      workerType = "Verifier"
      agent = "Diagnostic Agent"
      status = "Ready"
      resultPath = "verification/diagnostic-report.json"
    }
  )
  fixers = @(
    [ordered]@{
      workerId = "fixer-tars"
      workerType = "Fixer"
      agent = "TARS"
      status = "Ready"
      resultPath = "fixes/fixer-report.md"
    }
  )
  aggregator = [ordered]@{
    workerId = "aggregator-jarvis"
    workerType = "Aggregator"
    agent = "Jarvis"
    status = "Ready"
    resultPath = "aggregation/aggregate-report.md"
  }
}

$taskGraphPath = Join-Path $workflowDir "task-graph.json"
$manifestPath = Join-Path $workflowDir "worker-manifest.json"

$taskGraph | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $taskGraphPath -Encoding UTF8
$manifest | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

if (-not $NoEvent) {
  $eventLog = Join-Path $repoRoot "dashboards/task-events.jsonl"
  Add-WorkflowEvent `
    -EventLog $eventLog `
    -WorkflowId $workflowId `
    -Stage "task-graph" `
    -Agent "Friday" `
    -Role "Task Graph Manager" `
    -TaskTitle "Dynamic Workflow Task Graph 생성" `
    -Outputs @(
      $taskGraphPath.Substring($repoRoot.Length + 1),
      $manifestPath.Substring($repoRoot.Length + 1)
    )
}

[ordered]@{
  requestId = $RequestId
  workflowId = $workflowId
  dynamicLevel = "L4"
  workflowDir = Convert-PathForJson ($workflowDir.Substring($repoRoot.Length + 1))
  taskGraph = Convert-PathForJson ($taskGraphPath.Substring($repoRoot.Length + 1))
  workerManifest = Convert-PathForJson ($manifestPath.Substring($repoRoot.Length + 1))
  taskCount = $taskItems.Count
  maxParallel = $MaxParallel
} | ConvertTo-Json -Depth 6
