[CmdletBinding()]
param(
  [int] $Port = 8790,
  [int] $MaxPort = 8800,
  [string] $BindAddress = "0.0.0.0",
  [switch] $Restart
)

$targetScript = Resolve-Path (Join-Path $PSScriptRoot "..\..\..\catbook\scripts\start-intranet-preview.ps1")
& $targetScript.Path -Port $Port -MaxPort $MaxPort -BindAddress $BindAddress -Restart:$Restart
