# TypeScript Dependencies Installation Script
# PowerShell version for Windows

Write-Host "============================================" -ForegroundColor Green
Write-Host "TypeScript Dependencies Installation" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# Save current directory
$ProjectRoot = Get-Location

# Check if npm is available
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npm is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js and npm first" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Current directory: $ProjectRoot"
Write-Host ""

# Install frontend dependencies
Write-Host "[1/2] Installing frontend dependencies..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

if (Test-Path "frontend") {
    Set-Location -Path "frontend"
    Write-Host "Installing: @types/react @types/react-dom @types/node typescript" -ForegroundColor Yellow
    
    try {
        npm install @types/react @types/react-dom @types/node typescript
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed"
        }
        Write-Host "Frontend dependencies installed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Frontend dependencies installation failed" -ForegroundColor Red
        Set-Location -Path $ProjectRoot
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "ERROR: frontend directory not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Install backend dependencies
Write-Host "[2/2] Installing backend dependencies..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

if (Test-Path "$ProjectRoot\backend") {
    Set-Location -Path "$ProjectRoot\backend"
    Write-Host "Installing: @types/cors @types/express @types/multer @types/node @types/papaparse ts-node typescript" -ForegroundColor Yellow
    
    try {
        npm install @types/cors @types/express @types/multer @types/node @types/papaparse ts-node typescript
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed"
        }
        Write-Host "Backend dependencies installed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Backend dependencies installation failed" -ForegroundColor Red
        Set-Location -Path $ProjectRoot
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "ERROR: backend directory not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Return to project root
Set-Location -Path $ProjectRoot

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "SUCCESS: All dependencies installed!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "TypeScript upgrade completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start frontend: cd frontend; npm start" -ForegroundColor Yellow
Write-Host "  2. Start backend:  cd backend; npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: Use separate terminal windows for each service" -ForegroundColor Magenta
Write-Host ""
Read-Host "Press Enter to exit" 