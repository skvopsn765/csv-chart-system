@echo off
setlocal EnableDelayedExpansion
echo Stopping development servers (Port 3000 and 5000)...
echo.

REM Kill processes on Port 3000 (usually frontend)
echo Checking Port 3000...
set "found3000=0"
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Found process on Port 3000, PID: %%a
    taskkill /F /PID %%a >nul 2>&1
    set "found3000=1"
)
if !found3000! == 1 (
    echo ✅ Processed Port 3000 programs
) else (
    echo ℹ️  No processes running on Port 3000
)

echo.

REM Kill processes on Port 5000 (usually backend)
echo Checking Port 5000...
set "found5000=0"
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Found process on Port 5000, PID: %%a
    taskkill /F /PID %%a >nul 2>&1
    set "found5000=1"
)
if !found5000! == 1 (
    echo ✅ Processed Port 5000 programs
) else (
    echo ℹ️  No processes running on Port 5000
)

echo.

REM Additional Node.js process cleanup
echo Cleaning up remaining Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if !errorlevel! == 0 (
    echo ✅ Cleaned up Node.js processes
) else (
    echo ℹ️  No additional Node.js processes found
)

echo.
echo 🎉 Development server cleanup completed!
echo.
pause 