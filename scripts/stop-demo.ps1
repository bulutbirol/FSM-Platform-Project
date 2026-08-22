$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

docker compose down
if ($LASTEXITCODE -ne 0) {
    throw "Docker servisleri durdurulamadi."
}

Write-Host "ServiceFlow durduruldu. Veritabani verileri korundu." -ForegroundColor Green
