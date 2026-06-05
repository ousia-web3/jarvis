[CmdletBinding()]
param(
  [ValidateSet("Report", "MarkReviewed")]
  [string] $Mode = "Report",
  [string] $Queue = "memory/purge-queue.md"
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptRoot "..")
$queuePath = Join-Path $repoRoot $Queue

if (-not (Test-Path -LiteralPath $queuePath)) {
  throw "Purge queue not found: $queuePath"
}

$content = Get-Content -Encoding UTF8 -Raw -LiteralPath $queuePath
$openItems = @($content -split "`n" | Where-Object { $_ -match "\|\s*Open\s*\|" })

if ($Mode -eq "MarkReviewed") {
  $stamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz"
  Add-Content -Encoding UTF8 -LiteralPath $queuePath -Value "`n<!-- Purge queue reviewed at $stamp. No destructive deletion was performed by this script. -->"
}

[ordered]@{
  mode = $Mode
  queue = $queuePath
  openItems = $openItems.Count
  destructiveActionPerformed = $false
  note = "This script reports or marks review only. Actual deletion requires explicit Human Conductor approval when user files are affected."
} | ConvertTo-Json -Depth 3
