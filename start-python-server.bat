@echo off
echo ========================================
echo    CyberSentinel Development Server
echo         (Python HTTP Server)
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    echo.
    pause
    exit /b 1
)

echo Python version:
python --version
echo.

echo Starting CyberSentinel server...
echo Server will be available at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start Python HTTP server
python -m http.server 8000

pause