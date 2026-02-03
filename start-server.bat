@echo off
echo ========================================
echo    CyberSentinel Development Server
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if server.js exists
if not exist "server.js" (
    echo ERROR: server.js not found in current directory
    echo Please make sure you're running this from the project root
    echo.
    pause
    exit /b 1
)

echo Starting CyberSentinel server...
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the server
node server.js

pause