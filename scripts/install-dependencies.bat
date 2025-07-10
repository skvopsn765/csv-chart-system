@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ============================================
echo TypeScript Dependencies Installation
echo ============================================
echo.

REM Save current directory
set "PROJECT_ROOT=%CD%"

echo Current directory: %PROJECT_ROOT%
echo.

REM Install frontend dependencies
echo [1/2] Installing frontend dependencies...
echo ----------------------------------------
if exist "frontend" (
    cd /d "%PROJECT_ROOT%\frontend"
    echo Installing: @types/react @types/react-dom @types/node typescript
    echo.
    
    npm install @types/react @types/react-dom @types/node typescript
    
    REM Check if node_modules exists and has content instead of specific packages
    if exist "node_modules" (
        if exist "node_modules\typescript" (
            echo.
            echo ✓ Frontend dependencies installed successfully!
            set "FRONTEND_OK=1"
        ) else (
            echo.
            echo ✗ TypeScript package missing
            set "FRONTEND_OK=0"
        )
    ) else (
        echo.
        echo ✗ node_modules directory missing
        set "FRONTEND_OK=0"
    )
) else (
    echo ERROR: frontend directory not found
    pause
    exit /b 1
)

echo.

REM Install backend dependencies
echo [2/2] Installing backend dependencies...
echo ----------------------------------------
if exist "%PROJECT_ROOT%\backend" (
    cd /d "%PROJECT_ROOT%\backend"
    echo Installing: @types/cors @types/express @types/multer @types/node @types/papaparse ts-node typescript
    echo.
    
    npm install @types/cors @types/express @types/multer @types/node @types/papaparse ts-node typescript
    
    REM Check if node_modules exists and has key packages
    if exist "node_modules" (
        if exist "node_modules\ts-node" (
            echo.
            echo ✓ Backend dependencies installed successfully!
            set "BACKEND_OK=1"
        ) else (
            echo.
            echo ✗ ts-node package missing
            set "BACKEND_OK=0"
        )
    ) else (
        echo.
        echo ✗ node_modules directory missing
        set "BACKEND_OK=0"
    )
) else (
    echo ERROR: backend directory not found
    pause
    exit /b 1
)

REM Return to project root
cd /d "%PROJECT_ROOT%"

echo.
echo ============================================

if "!FRONTEND_OK!"=="1" if "!BACKEND_OK!"=="1" (
    echo ✓ SUCCESS: All dependencies installed!
    echo ============================================
    echo.
    echo TypeScript upgrade completed successfully!
    echo.
    echo Note: npm warnings are normal and can be ignored.
    echo.
    echo Next steps:
    echo   1. Start frontend: cd frontend ^&^& npm start
    echo   2. Start backend:  cd backend ^&^& npm run dev
    echo.
    echo Use separate terminal windows for each service
) else (
    echo ✗ FAILED: Some dependencies installation failed
    echo ============================================
    if "!FRONTEND_OK!"=="0" echo   - Frontend installation failed
    if "!BACKEND_OK!"=="0" echo   - Backend installation failed
    echo.
    echo Try manual installation from INSTALL_GUIDE.md
)

echo.
pause 