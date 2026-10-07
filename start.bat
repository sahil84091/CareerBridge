@echo off
setlocal
title CareerBridge AI Launcher
cd /d "%~dp0"

echo ========================================================================
echo   CareerBridge AI - Starting Development Environment
echo ========================================================================
echo.

REM Free ports 8000 and 3000 if lingering from previous run
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

REM 1. Start backend in its own window
echo [1/3] Starting Backend (FastAPI on http://localhost:8000)...
start "CareerBridge Backend" cmd /k run-backend.bat

REM 2. Wait for backend to initialize
echo [2/3] Waiting for Backend to initialize...
ping -n 6 127.0.0.1 >nul

REM 3. Open browser
echo [3/3] Opening CareerBridge in your browser...
start http://localhost:3000

REM 4. Start frontend in the current window
echo.
echo ========================================================================
echo   CareerBridge is running:
echo   - Frontend App : http://localhost:3000
echo   - Backend API  : http://localhost:8000
echo   - API Docs     : http://localhost:8000/docs
echo.
echo   To stop the frontend, press Ctrl+C in this window.
echo   To stop all services at once, double-click stop.bat.
echo ========================================================================
echo.

call "%~dp0run-frontend.bat"
