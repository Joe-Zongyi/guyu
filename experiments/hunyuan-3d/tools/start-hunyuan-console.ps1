param(
  [int]$Port = 8766
)

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$ExperimentRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$Server = Join-Path $ExperimentRoot "tools\hunyuan_console_server.py"

if (-not (Test-Path $Server)) {
  throw "Server not found: $Server"
}

Write-Host "Starting Hunyuan 3D console on http://127.0.0.1:$Port/experiments/hunyuan-3d/ui/hunyuan-3d-console.html" -ForegroundColor Green
Set-Location $RepoRoot
Start-Process "http://127.0.0.1:$Port/experiments/hunyuan-3d/ui/hunyuan-3d-console.html"
python $Server $Port
