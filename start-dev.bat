@echo off
echo ===========================================
echo CSV Chart System - Development Startup
echo ===========================================
echo.

echo Starting backend server...
start "CSV-Backend" cmd /k "cd /d %~dp0backend & npm start"

echo Waiting 3 seconds before starting frontend...
timeout /t 3 /nobreak > nul

echo Starting frontend application...
start "CSV-Frontend" cmd /k "cd /d %~dp0frontend & npm start"

echo.
echo ===========================================
echo Startup Complete!
echo Backend Server: http://localhost:5000
echo Frontend App: http://localhost:3000
echo ===========================================
echo.
echo Press any key to close this window...
pause > nul 