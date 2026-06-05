[CmdletBinding()]
param(
  [string] $WorkRequestsRoot = "work-requests",
  [double] $LargeEvidenceMB = 5,
  [switch] $Markdown
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptRoot "..")
$workRootPath = Join-Path $repoRoot $WorkRequestsRoot

if (-not (Test-Path -LiteralPath $workRootPath)) {
  throw "Work requests root not found: $workRootPath"
}

$requests = Get-ChildItem -LiteralPath $workRootPath -Directory | Sort-Object Name
$items = foreach ($request in $requests) {
  $readmePath = Join-Path $request.FullName "README.md"
  $evidencePath = Join-Path $request.FullName "evidence"
  $outputPath = Join-Path $request.FullName "outputs"

  $evidenceFiles = @()
  if (Test-Path -LiteralPath $evidencePath) {
    $evidenceFiles = @(Get-ChildItem -LiteralPath $evidencePath -Recurse -File -ErrorAction SilentlyContinue)
  }

  $outputFiles = @()
  if (Test-Path -LiteralPath $outputPath) {
    $outputFiles = @(Get-ChildItem -LiteralPath $outputPath -Recurse -File -ErrorAction SilentlyContinue)
  }

  $evidenceSizeMB = if ($evidenceFiles.Count -gt 0) {
    [math]::Round((($evidenceFiles | Measure-Object Length -Sum).Sum / 1MB), 2)
  } else {
    0
  }

  $issues = @()
  if (-not (Test-Path -LiteralPath $readmePath)) { $issues += "missing-readme" }
  if ((Test-Path -LiteralPath $evidencePath) -and $evidenceFiles.Count -eq 0) { $issues += "empty-evidence" }
  if ((Test-Path -LiteralPath $outputPath) -and $outputFiles.Count -eq 0) { $issues += "empty-outputs" }
  if ($evidenceSizeMB -gt $LargeEvidenceMB) { $issues += "large-evidence" }

  [pscustomobject]@{
    request = $request.Name
    hasReadme = Test-Path -LiteralPath $readmePath
    evidenceFiles = $evidenceFiles.Count
    evidenceSizeMB = $evidenceSizeMB
    outputFiles = $outputFiles.Count
    issues = $issues
    status = if ($issues.Count -eq 0) { "OK" } else { "Review" }
  }
}

$summary = [ordered]@{
  generatedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
  workRequestsRoot = $WorkRequestsRoot
  totalRequests = $items.Count
  reviewRequests = @($items | Where-Object { $_.status -eq "Review" }).Count
  missingReadme = @($items | Where-Object { -not $_.hasReadme }).Count
  emptyEvidence = @($items | Where-Object { $_.issues -contains "empty-evidence" }).Count
  emptyOutputs = @($items | Where-Object { $_.issues -contains "empty-outputs" }).Count
  largeEvidence = @($items | Where-Object { $_.issues -contains "large-evidence" }).Count
  requests = $items
}

if ($Markdown) {
  "# Work Requests Health"
  ""
  "- totalRequests: $($summary.totalRequests)"
  "- reviewRequests: $($summary.reviewRequests)"
  "- missingReadme: $($summary.missingReadme)"
  "- emptyEvidence: $($summary.emptyEvidence)"
  "- emptyOutputs: $($summary.emptyOutputs)"
  "- largeEvidence: $($summary.largeEvidence)"
  ""
  "| Request | Status | Evidence | Evidence MB | Outputs | Issues |"
  "| --- | --- | ---: | ---: | ---: | --- |"
  foreach ($item in $items) {
    $issueText = if ($item.issues.Count -gt 0) { $item.issues -join ", " } else { "-" }
    "| $($item.request) | $($item.status) | $($item.evidenceFiles) | $($item.evidenceSizeMB) | $($item.outputFiles) | $issueText |"
  }
} else {
  $summary | ConvertTo-Json -Depth 6
}
