[CmdletBinding()]
param(
  [string] $TaskName = "JarvisStockMarketDashboardDailyUpdate",
  [string] $At = "07:00"
)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$updateScript = Join-Path $scriptRoot "update-market-dashboard.ps1"
$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$updateScript`""
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Jarvis stock-auto-trader market dashboard daily batch update" `
  -Force

Write-Host "registered=$TaskName at=$At script=$updateScript"
