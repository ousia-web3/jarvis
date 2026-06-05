[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $RequestId,

  [string] $WorkflowDir = "",
  [int] $MaxParallel = 4,
  [switch] $AllowCommands,
  [switch] $VerifyOnly,
  [switch] $NoFixer,
  [switch] $NoEvent
)

$ErrorActionPreference = "Stop"

function Convert-PathForJson([string] $Path) {
  return $Path.Replace("\", "/")
}

function Find-WorkflowDir([string] $RepoRoot, [string] $Id) {
  $workRoot = Join-Path $RepoRoot "work-requests"
  $folder = Get-ChildItem -LiteralPath $workRoot -Directory |
    Where-Object { $_.Name -eq $Id -or $_.Name -like "*-$Id" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $folder) {
    throw "Work request folder not found for requestId=$Id"
  }

  $candidate = Join-Path $folder.FullName "dynamic-workflow"
  if (-not (Test-Path -LiteralPath $candidate)) {
    throw "Dynamic workflow folder not found: $candidate"
  }
  return $candidate
}

function Read-Json([string] $Path) {
  return Get-Content -Raw -Encoding UTF8 -LiteralPath $Path | ConvertFrom-Json
}

function Write-Json([string] $Path, [object] $Value) {
  $parent = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
  }
  $Value | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Resolve-WorkflowPath([string] $Base, [string] $Path) {
  if ([System.IO.Path]::IsPathRooted($Path)) {
    return $Path
  }
  return Join-Path $Base $Path
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

function Add-WorkflowEvent(
  [string] $EventLog,
  [string] $WorkflowId,
  [string] $Stage,
  [string] $Agent,
  [string] $Role,
  [string] $Status,
  [string] $TaskTitle,
  [string] $Channel,
  [string] $WorkerId,
  [string] $WorkerType,
  [string] $TaskId,
  [string[]] $Outputs
) {
  if ($NoEvent) { return }

  $event = [ordered]@{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz"
    eventId = "EVT-DWF-" + (Get-Date -Format "yyyyMMddHHmmssfff") + "-" + (Get-Random -Minimum 1000 -Maximum 9999)
    requestId = $RequestId
    agent = $Agent
    role = $Role
    assignment = "To"
    status = $Status
    task = $TaskTitle
    detail = "Dynamic Workflow $Stage"
    riskLevel = "Medium"
    outputs = @($Outputs | ForEach-Object { Convert-PathForJson $_ })
    channel = $Channel
    skill = "dynamic-workflow"
    delegationType = "dynamic-workflow"
    workflowId = $WorkflowId
    workflowStage = $Stage
    workerId = $WorkerId
    workerType = $WorkerType
    taskId = $TaskId
    dynamicLevel = "L4"
  }

  Add-JsonLineWithRetry $EventLog ($event | ConvertTo-Json -Compress -Depth 8)
}

function Run-WorkerBatch([array] $Workers, [string] $BaseDir, [bool] $AllowCommandExecution, [int] $Limit) {
  $pending = [System.Collections.Queue]::new()
  foreach ($worker in $Workers) {
    $pending.Enqueue($worker)
  }

  $running = @()
  $results = @()

  while ($pending.Count -gt 0 -or $running.Count -gt 0) {
    while ($pending.Count -gt 0 -and $running.Count -lt $Limit) {
      $worker = $pending.Dequeue()
      $workerJson = $worker | ConvertTo-Json -Depth 10 -Compress
      $job = Start-Job -ArgumentList $workerJson, $BaseDir, $AllowCommandExecution -ScriptBlock {
        param($WorkerJson, $WorkflowBase, $AllowCommandExecution)

        $worker = $WorkerJson | ConvertFrom-Json
        $startedAt = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz"
        $resultPath = if ([System.IO.Path]::IsPathRooted([string]$worker.resultPath)) {
          [string]$worker.resultPath
        } else {
          Join-Path $WorkflowBase ([string]$worker.resultPath)
        }
        $contextPath = if ([System.IO.Path]::IsPathRooted([string]$worker.inputContext)) {
          [string]$worker.inputContext
        } else {
          Join-Path $WorkflowBase ([string]$worker.inputContext)
        }

        $parent = Split-Path -Parent $resultPath
        if (-not (Test-Path -LiteralPath $parent)) {
          New-Item -ItemType Directory -Force -Path $parent | Out-Null
        }

        $status = "Done"
        $exitCode = 0
        $stdout = ""
        $stderr = ""
        $mode = "local-worker"

        try {
          if ($AllowCommandExecution -and $worker.command) {
            $mode = "command-worker"
            $output = powershell -NoProfile -ExecutionPolicy Bypass -Command ([string]$worker.command) 2>&1
            $exitCode = if ($LASTEXITCODE -ne $null) { $LASTEXITCODE } else { 0 }
            $stdout = ($output | Out-String).Trim()
            if ($exitCode -ne 0) {
              $status = "Failed"
              $stderr = "Command exited with code $exitCode"
            }
          } else {
            $contextPreview = if (Test-Path -LiteralPath $contextPath) {
              (Get-Content -Encoding UTF8 -LiteralPath $contextPath -TotalCount 12) -join "`n"
            } else {
              ""
            }
            $stdout = "Local worker completed without external command.`n$contextPreview"
          }
        } catch {
          $status = "Failed"
          $stderr = $_.Exception.Message
          $exitCode = 1
        }

        $result = [ordered]@{
          workerId = $worker.workerId
          taskId = $worker.taskId
          workerType = $worker.workerType
          agent = $worker.agent
          status = $status
          mode = $mode
          startedAt = $startedAt
          finishedAt = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz"
          inputContext = $worker.inputContext
          resultPath = $worker.resultPath
          exitCode = $exitCode
          stdout = $stdout
          stderr = $stderr
        }

        $result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $resultPath -Encoding UTF8
        return $result
      }
      $running += $job
    }

    if ($running.Count -gt 0) {
      $done = Wait-Job -Job $running -Any
      foreach ($job in @($done)) {
        $results += Receive-Job -Job $job
        Remove-Job -Job $job
      }
      $running = @($running | Where-Object { $_.State -eq "Running" })
    }
  }

  return @($results)
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptRoot "..")).Path
if (-not $WorkflowDir) {
  $WorkflowDir = Find-WorkflowDir $repoRoot $RequestId
} elseif (-not [System.IO.Path]::IsPathRooted($WorkflowDir)) {
  $WorkflowDir = Join-Path $repoRoot $WorkflowDir
}
$WorkflowDir = (Resolve-Path $WorkflowDir).Path

$taskGraphPath = Join-Path $WorkflowDir "task-graph.json"
$manifestPath = Join-Path $WorkflowDir "worker-manifest.json"
$taskGraph = Read-Json $taskGraphPath
$manifest = Read-Json $manifestPath
$workflowId = [string]$taskGraph.workflowId
$eventLog = Join-Path $repoRoot "dashboards/task-events.jsonl"

Add-WorkflowEvent `
  -EventLog $eventLog `
  -WorkflowId $workflowId `
  -Stage "parallel-execution" `
  -Agent "TARS" `
  -Role "Parallel Executor" `
  -Status "In Progress" `
  -TaskTitle "Dynamic Workflow worker 병렬 실행" `
  -Channel "implementation" `
  -WorkerId "parallel-executor" `
  -WorkerType "Executor" `
  -TaskId "" `
  -Outputs @($WorkflowDir.Substring($repoRoot.Length + 1))

$workerResults = @()
if (-not $VerifyOnly) {
  $workerResults = Run-WorkerBatch -Workers @($manifest.workers) -BaseDir $WorkflowDir -AllowCommandExecution ([bool]$AllowCommands) -Limit $MaxParallel
} else {
  foreach ($worker in @($manifest.workers)) {
    $resultPath = Resolve-WorkflowPath $WorkflowDir ([string]$worker.resultPath)
    if (Test-Path -LiteralPath $resultPath) {
      $workerResults += Read-Json $resultPath
    }
  }
}

foreach ($result in $workerResults) {
  Add-WorkflowEvent `
    -EventLog $eventLog `
    -WorkflowId $workflowId `
    -Stage "parallel-execution" `
    -Agent ([string]$result.agent) `
    -Role ([string]$result.workerType) `
    -Status ([string]$result.status) `
    -TaskTitle ("Worker result: " + [string]$result.taskId) `
    -Channel "implementation" `
    -WorkerId ([string]$result.workerId) `
    -WorkerType ([string]$result.workerType) `
    -TaskId ([string]$result.taskId) `
    -Outputs @((Resolve-WorkflowPath $WorkflowDir ([string]$result.resultPath)).Substring($repoRoot.Length + 1))
}

$taskById = @{}
foreach ($task in @($taskGraph.tasks)) {
  $taskById[[string]$task.taskId] = $task
}

$checks = @()
foreach ($worker in @($manifest.workers)) {
  $taskId = [string]$worker.taskId
  $resultPath = Resolve-WorkflowPath $WorkflowDir ([string]$worker.resultPath)
  $result = if (Test-Path -LiteralPath $resultPath) { Read-Json $resultPath } else { $null }
  $task = $taskById[$taskId]
  $expected = @()
  if ($task -and $task.PSObject.Properties["expectedOutputs"]) {
    $expected = @($task.expectedOutputs)
  }
  $missingOutputs = @()
  foreach ($output in $expected) {
    if (-not $output) { continue }
    $candidate = if ([System.IO.Path]::IsPathRooted([string]$output)) {
      [string]$output
    } else {
      Join-Path $repoRoot ([string]$output)
    }
    if (-not (Test-Path -LiteralPath $candidate)) {
      $missingOutputs += [string]$output
    }
  }

  $passed = $result -and $result.status -eq "Done" -and $missingOutputs.Count -eq 0
  $checks += [ordered]@{
    taskId = $taskId
    workerId = [string]$worker.workerId
    resultPath = Convert-PathForJson ([string]$worker.resultPath)
    resultExists = [bool]$result
    resultStatus = if ($result) { [string]$result.status } else { "Missing" }
    expectedOutputs = $expected
    missingOutputs = $missingOutputs
    passed = [bool]$passed
  }
}

$failedChecks = @($checks | Where-Object { -not $_.passed })
$verification = [ordered]@{
  workflowId = $workflowId
  requestId = $RequestId
  verifier = "Data"
  status = if ($failedChecks.Count -eq 0) { "Pass" } else { "Needs Fixer" }
  checkedAt = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz"
  checks = $checks
}
$verificationJsonPath = Join-Path $WorkflowDir "verification/verification-report.json"
$verificationMdPath = Join-Path $WorkflowDir "verification/verification-report.md"
Write-Json $verificationJsonPath $verification

$verificationLines = @(
  "# Dynamic Workflow Verification",
  "",
  "- Workflow ID: $workflowId",
  "- Request ID: $RequestId",
  "- Status: $($verification.status)",
  "- Checked At: $($verification.checkedAt)",
  "",
  "## Checks",
  ""
)
foreach ($check in $checks) {
  $mark = if ($check.passed) { "PASS" } else { "FAIL" }
  $verificationLines += "- $mark '$($check.taskId)' via '$($check.workerId)' result '$($check.resultStatus)'"
  if ($check.missingOutputs.Count -gt 0) {
    $verificationLines += "  - Missing outputs: $($check.missingOutputs -join ', ')"
  }
}
Set-Content -LiteralPath $verificationMdPath -Encoding UTF8 -Value $verificationLines

if ($failedChecks.Count -eq 0) {
  $verificationEventStatus = "Done"
} else {
  $verificationEventStatus = "Review"
}
$verificationOutputs = @(
  $verificationJsonPath.Substring($repoRoot.Length + 1),
  $verificationMdPath.Substring($repoRoot.Length + 1)
)
$verificationEventParams = @{
  EventLog = $eventLog;
  WorkflowId = $workflowId;
  Stage = "verification";
  Agent = "Data";
  Role = "Verifier";
  Status = $verificationEventStatus;
  TaskTitle = "Dynamic Workflow verification";
  Channel = "analysis";
  WorkerId = "verifier-data";
  WorkerType = "Verifier";
  TaskId = "";
  Outputs = $verificationOutputs;
}
Add-WorkflowEvent @verificationEventParams

$fixerReportPath = Join-Path $WorkflowDir "fixes/fixer-report.md"
$fixerStatus = "Skipped"
if ($failedChecks.Count -gt 0 -and -not $NoFixer) {
  $fixerStatus = "Review"
  $fixerLines = @(
    "# Dynamic Workflow Fixer Report",
    "",
    "- Workflow ID: $workflowId",
    "- Status: Review",
    "- Policy: 자동 덮어쓰기 대신 실패 원인과 다음 수정 액션을 기록한다.",
    "",
    "## Failed Tasks",
    ""
  )
  foreach ($check in $failedChecks) {
    $missingOutputText = $check.missingOutputs -join ", "
    $fixerLines += "- '$($check.taskId)': result '$($check.resultStatus)', missing outputs '$missingOutputText'"
  }
  Set-Content -LiteralPath $fixerReportPath -Encoding UTF8 -Value $fixerLines

  Add-WorkflowEvent `
    -EventLog $eventLog `
    -WorkflowId $workflowId `
    -Stage "fixer" `
    -Agent "TARS" `
    -Role "Fixer" `
    -Status "Review" `
    -TaskTitle "Dynamic Workflow Fixer 검토 필요" `
    -Channel "implementation" `
    -WorkerId "fixer-tars" `
    -WorkerType "Fixer" `
    -TaskId "" `
    -Outputs @($fixerReportPath.Substring($repoRoot.Length + 1))
}

if ($failedChecks.Count -eq 0) {
  $aggregateStatus = "Done"
} else {
  $aggregateStatus = "Review"
}
$aggregatePath = Join-Path $WorkflowDir "aggregation/aggregate-report.md"
$workerCount = @($manifest.workers).Count
$passedCheckCount = @($checks | Where-Object { $_.passed }).Count
$failedCheckCount = $failedChecks.Count
$generatedAt = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz"
$aggregateLines = [System.Collections.Generic.List[string]]::new()
$aggregateLines.Add("# Dynamic Workflow Aggregate Report") | Out-Null
$aggregateLines.Add("") | Out-Null
$aggregateLines.Add("- Workflow ID: $workflowId") | Out-Null
$aggregateLines.Add("- Request ID: $RequestId") | Out-Null
$aggregateLines.Add("- Dynamic Level: L4") | Out-Null
$aggregateLines.Add("- Overall Status: $aggregateStatus") | Out-Null
$aggregateLines.Add("- Worker Count: $workerCount") | Out-Null
$aggregateLines.Add("- Passed Checks: $passedCheckCount") | Out-Null
$aggregateLines.Add("- Failed Checks: $failedCheckCount") | Out-Null
$aggregateLines.Add("- Generated At: $generatedAt") | Out-Null
$aggregateLines.Add("") | Out-Null
$aggregateLines.Add("## Result Paths") | Out-Null
$aggregateLines.Add("") | Out-Null
$aggregateLines.Add("- Task Graph: 'task-graph.json'") | Out-Null
$aggregateLines.Add("- Worker Manifest: 'worker-manifest.json'") | Out-Null
$aggregateLines.Add("- Verification: 'verification/verification-report.md'") | Out-Null
if (Test-Path -LiteralPath $fixerReportPath) {
  $aggregateLines.Add("- Fixer: 'fixes/fixer-report.md'") | Out-Null
}
$aggregateLines.Add("") | Out-Null
$aggregateLines.Add("## Next") | Out-Null
$aggregateLines.Add("") | Out-Null
if ($failedChecks.Count -eq 0) {
  $aggregateLines.Add("- All worker results passed verification.") | Out-Null
} else {
  $aggregateLines.Add("- Rework failed tasks using the Fixer report.") | Out-Null
}
if (-not $aggregatePath) {
  $aggregatePath = Join-Path $WorkflowDir "aggregation/aggregate-report.md"
}
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $aggregatePath) | Out-Null
Set-Content -LiteralPath $aggregatePath -Encoding UTF8 -Value $aggregateLines.ToArray()

$aggregateOutputs = @($aggregatePath.Substring($repoRoot.Length + 1))
$aggregateEventParams = @{
  EventLog = $eventLog;
  WorkflowId = $workflowId;
  Stage = "aggregation";
  Agent = "Jarvis";
  Role = "Aggregator";
  Status = $aggregateStatus;
  TaskTitle = "Dynamic Workflow aggregation";
  Channel = "strategy";
  WorkerId = "aggregator-jarvis";
  WorkerType = "Aggregator";
  TaskId = "";
  Outputs = $aggregateOutputs;
}
Add-WorkflowEvent @aggregateEventParams

[ordered]@{
  requestId = $RequestId
  workflowId = $workflowId
  dynamicLevel = "L4"
  workflowDir = Convert-PathForJson ($WorkflowDir.Substring($repoRoot.Length + 1))
  workerCount = @($manifest.workers).Count
  verificationStatus = $verification.status
  aggregateStatus = $aggregateStatus
  fixerStatus = $fixerStatus
  verificationReport = Convert-PathForJson ($verificationMdPath.Substring($repoRoot.Length + 1))
  aggregateReport = Convert-PathForJson ($aggregatePath.Substring($repoRoot.Length + 1))
} | ConvertTo-Json -Depth 8
