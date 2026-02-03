@echo off
echo Starting CyberSentinel Test Server...
echo.
echo This will start a simple HTTP server for testing.
echo Make sure you have Python installed.
echo.
echo Available at: http://localhost:8000
echo Admin Dashboard: http://localhost:8000/admin-dashboard.html
echo Contact Test: http://localhost:8000/test-contact.html
echo.
echo Press Ctrl+C to stop the server
echo.

python -m http.server 8000
pause