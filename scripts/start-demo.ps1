$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker bulunamadi. Once Docker Desktop'i kurun."
}

function Test-DockerEngine {
    docker info *> $null
    return $LASTEXITCODE -eq 0
}

if (-not (Test-DockerEngine)) {
    $dockerDesktop = @(
        "C:\Program Files\Docker\Docker\Docker Desktop.exe",
        (Join-Path $env:LOCALAPPDATA "Programs\DockerDesktop\Docker Desktop.exe")
    ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

    if (-not $dockerDesktop) {
        throw "Docker Desktop uygulamasi bulunamadi."
    }

    Write-Host "Docker Desktop baslatiliyor..."
    Start-Process -FilePath $dockerDesktop

    $deadline = (Get-Date).AddMinutes(3)
    while ((Get-Date) -lt $deadline -and -not (Test-DockerEngine)) {
        Start-Sleep -Seconds 3
    }

    if (-not (Test-DockerEngine)) {
        throw "Docker Desktop 3 dakika icinde hazir olmadi. Docker Desktop'i kontrol edip tekrar deneyin."
    }
}

Write-Host "ServiceFlow olusturuluyor ve baslatiliyor..."
docker compose up --detach --build
if ($LASTEXITCODE -ne 0) {
    throw "Docker servisleri baslatilamadi."
}

Write-Host "Genel demo baglantisi bekleniyor..."
$url = $null
$deadline = (Get-Date).AddMinutes(2)

while ((Get-Date) -lt $deadline -and -not $url) {
    $logs = docker compose logs cloudflared 2>&1 | Out-String
    $match = [regex]::Match($logs, "https://[a-z0-9-]+\.trycloudflare\.com")
    if ($match.Success) {
        $url = $match.Value
    } else {
        Start-Sleep -Seconds 2
    }
}

if (-not $url) {
    throw "Cloudflare demo baglantisi 2 dakika icinde olusmadi. 'docker compose logs cloudflared' komutunu kontrol edin."
}

Write-Host ""
Write-Host "ServiceFlow hazir:" -ForegroundColor Green
Write-Host $url -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo bittiginde demo-durdur.bat dosyasina cift tiklayin."

Start-Process $url
