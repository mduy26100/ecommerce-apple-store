@echo off
title Apple Store - Runner
cd /d "%~dp0"

echo =====================================================================
echo                ECOMMERCE APPLE STORE - RUNNER
echo =====================================================================
echo.
echo [1/3] Don dep tien trinh cu...
powershell -NoProfile -Command "taskkill /F /T /FI 'WINDOWTITLE eq Apple Store - Backend*' >$null 2>&1; taskkill /F /T /FI 'WINDOWTITLE eq Apple Store - Frontend*' >$null 2>&1; foreach($port in @(5173,5288,7157)){foreach($c in (Get-NetTCPConnection -LocalPort $port -EA SilentlyContinue)){Stop-Process -Id $c.OwningProcess -Force -EA SilentlyContinue}}"

echo [2/3] Khoi dong tien trinh giam sat (Watcher)...
start "" /B powershell -NoProfile -WindowStyle Hidden -Command "$p=Get-Process -Id (Get-CimInstance Win32_Process -Filter ('ProcessId='+$PID)).ParentProcessId; $p.WaitForExit(); taskkill /F /T /FI 'WINDOWTITLE eq Apple Store - Backend*' >$null 2>&1; taskkill /F /T /FI 'WINDOWTITLE eq Apple Store - Frontend*' >$null 2>&1; foreach($port in @(5173,5288,7157)){foreach($c in (Get-NetTCPConnection -LocalPort $port -EA SilentlyContinue)){Stop-Process -Id $c.OwningProcess -Force -EA SilentlyContinue}}"

echo [3/3] Khoi chay Backend va Frontend tren 2 terminal...
start "Apple Store - Backend" /d "%~dp0apple-store-app\src\Host" cmd /k "title Apple Store - Backend && echo =================================================== && echo   [BACKEND] Dang chay dotnet run... && echo   Swagger UI: http://localhost:5288/swagger && echo =================================================== && dotnet run"

ping 127.0.0.1 -n 3 >nul

start "Apple Store - Frontend" /d "%~dp0apple-store-web" cmd /k "title Apple Store - Frontend && echo =================================================== && echo   [FRONTEND] Dang chay npm run dev... && echo   Website URL: http://localhost:5173 && echo =================================================== && npm run dev"

pause >nul
exit
