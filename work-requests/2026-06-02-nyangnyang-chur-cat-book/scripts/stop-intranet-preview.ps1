[CmdletBinding()]
param()

$targetScript = Resolve-Path (Join-Path $PSScriptRoot "..\..\..\catbook\scripts\stop-intranet-preview.ps1")
& $targetScript.Path
