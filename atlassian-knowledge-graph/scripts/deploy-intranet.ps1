param(
  [string] $HostAddress = "0.0.0.0",
  [int] $Port = 8822
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptRoot "..")
Set-Location $projectRoot

$env:APP_HOST = $HostAddress
$env:APP_PORT = [string] $Port
$env:ENABLE_MANUAL_SYNC = "false"
$env:ENABLE_SAMPLE_LOAD = "false"

$ip = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254*" } |
  Select-Object -First 1 -ExpandProperty IPAddress

if (-not $ip) {
  $ip = "localhost"
}

Write-Host "Atlassian Knowledge Graph intranet URL: http://$ip`:$Port"
python -m atlassian_kg.cli serve --host $HostAddress --port $Port
