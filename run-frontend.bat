@echo off
setlocal
cd /d "%~dp0frontend"
if not exist "package.json" (
  echo Could not find the frontend folder next to this script.
  pause
  exit /b 1
)
if not exist "%ProgramFiles%\nodejs\npm.cmd" (
  echo Node.js and npm were not found at "%ProgramFiles%\nodejs".
  echo Install Node.js, then run this file again.
  pause
  exit /b 1
)
echo Starting CareerBridge. Open http://localhost:3002 in your browser.
call "%ProgramFiles%\nodejs\npm.cmd" run dev -- --hostname 0.0.0.0 --port 3002
if errorlevel 1 echo The frontend stopped with an error. Check the message above.
pause
