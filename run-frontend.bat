@echo off
setlocal
title CareerBridge Frontend (Next.js on Port 3000)
cd /d "%~dp0frontend"

if not exist "package.json" (
  echo [ERROR] Could not find the frontend folder next to this script.
  pause
  exit /b 1
)

set "NPM_CMD="
if exist "%ProgramFiles%\nodejs\npm.cmd" set "NPM_CMD=%ProgramFiles%\nodejs\npm.cmd"
if "%NPM_CMD%"=="" where npm.cmd >nul 2>&1 && set "NPM_CMD=npm.cmd"
if "%NPM_CMD%"=="" where npm >nul 2>&1 && set "NPM_CMD=npm"

if "%NPM_CMD%"=="" (
  echo [ERROR] Node.js and npm were not found.
  echo Install Node.js from https://nodejs.org/, then run this file again.
  pause
  exit /b 1
)

echo Starting CareerBridge Frontend. Open http://localhost:3000 in your browser.
call "%NPM_CMD%" run dev -- --hostname 0.0.0.0 --port 3000

if errorlevel 1 (
  echo.
  echo [WARNING] The frontend stopped with an error. Check the message above.
  pause
)
