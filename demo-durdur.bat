@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-demo.ps1"
if errorlevel 1 (
    echo.
    echo Demo durdurulurken bir hata olustu.
)
echo.
pause
