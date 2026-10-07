@echo off
setlocal

title CareerBridge AI - Stopping Services

echo ========================================================================
echo   Stopping CareerBridge Services
echo ========================================================================

REM Stop processes listening on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING"') do (
    echo Terminating backend process on PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

REM Stop processes listening on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    echo Terminating frontend process on PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All CareerBridge services have been stopped.
ping -n 3 127.0.0.1 >nul
