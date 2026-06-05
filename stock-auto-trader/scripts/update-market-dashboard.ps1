[CmdletBinding()]
param(
  [string] $Output = "data/market_dashboard/latest.json",
  [int] $TimeoutSeconds = 8
)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptRoot "..")
Set-Location $projectRoot

python -m jarvis_trader.cli market-dashboard-update `
  --output $Output `
  --timeout-seconds $TimeoutSeconds
