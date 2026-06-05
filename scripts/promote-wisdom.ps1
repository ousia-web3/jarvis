[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $WisdomId,
  [Parameter(Mandatory = $true)]
  [string[]] $SourceTasks,
  [Parameter(Mandatory = $true)]
  [string] $ObservedPattern,
  [Parameter(Mandatory = $true)]
  [string] $AbstractPrinciple,
  [string] $WhenToApply = "반복 가능한 유사 작업",
  [string] $WhenNotToApply = "리스크나 맥락이 다른 작업",
  [string] $Owner = "Jarvis",
  [string] $ReviewDate = "",
  [switch] $Approve
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptRoot "..")
$memoryRoot = Join-Path $repoRoot "memory"
if (-not (Test-Path -LiteralPath $memoryRoot)) {
  New-Item -ItemType Directory -Force -Path $memoryRoot | Out-Null
}

$target = if ($Approve) { "wisdom-registry.md" } else { "wisdom-candidates.md" }
$targetPath = Join-Path $memoryRoot $target
if (-not $ReviewDate) { $ReviewDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd") }

$entry = @"

## $WisdomId

- Source Tasks: $($SourceTasks -join ", ")
- Observed Pattern: $ObservedPattern
- Abstract Principle: $AbstractPrinciple
- When to Apply: $WhenToApply
- When Not to Apply: $WhenNotToApply
- Owner: $Owner
- Review Date: $ReviewDate
- Status: $(if ($Approve) { "Approved" } else { "Candidate" })
"@

if (-not (Test-Path -LiteralPath $targetPath)) {
  "# $($target -replace '\\.md$', '')`n" | Set-Content -Encoding UTF8 -LiteralPath $targetPath
}

Add-Content -Encoding UTF8 -LiteralPath $targetPath -Value $entry

[ordered]@{
  wisdomId = $WisdomId
  target = $targetPath
  status = if ($Approve) { "approved" } else { "candidate" }
} | ConvertTo-Json -Depth 3
