@echo off
setlocal
title CareerBridge Backend (FastAPI on Port 8000)
cd /d "%~dp0"

echo ========================================================================
echo   CareerBridge Backend (FastAPI Core Engine)
echo   API Docs: http://localhost:8000/docs
echo ========================================================================
echo.

set "PYTHON_CMD=py"
py --version >nul 2>&1
if errorlevel 1 (
    python --version >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=python"
    ) else (
        echo [ERROR] Python not found in PATH.
        pause
        exit /b 1
    )
)

echo Using Python runtime: %PYTHON_CMD%
echo Starting FastAPI with uvicorn on http://localhost:8000 ...
echo.

%PYTHON_CMD% -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

if errorlevel 1 (
    echo.
    echo [ERROR] Backend stopped unexpectedly.
    pause
)
