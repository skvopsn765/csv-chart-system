# PowerShell Script: Stop Development Servers (Port 3000 and 5000)
# Usage: Right-click file -> "Run with PowerShell"
# Or execute in PowerShell: ./stop-dev-ports.ps1

Write-Host "Stopping development servers (Port 3000 and 5000)..." -ForegroundColor Yellow
Write-Host ""

# Function: Stop processes on specified port
function Stop-ProcessOnPort {
    param([int]$Port)

    Write-Host "Checking Port ${Port}..." -ForegroundColor Cyan

    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

        if ($processes) {
            foreach ($processId in $processes) {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "Found process on Port $($Port): $($process.ProcessName) (PID: $processId)" -ForegroundColor White
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "Stopped process on Port $($Port)" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "No processes running on Port ${Port}" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "Error checking Port ${Port}: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
}

# Stop Port 3000 (Frontend)
Stop-ProcessOnPort -Port 3000

# Stop Port 5000 (Backend)
Stop-ProcessOnPort -Port 5000

# Additional cleanup: Stop all Node.js processes
Write-Host "Cleaning up remaining Node.js processes..." -ForegroundColor Cyan
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object {
            Write-Host "Stopping Node.js process (PID: $($_.Id))" -ForegroundColor White
            $_ | Stop-Process -Force -ErrorAction SilentlyContinue
        }
        Write-Host "Cleaned up Node.js processes" -ForegroundColor Green
    } else {
        Write-Host "No additional Node.js processes found" -ForegroundColor Gray
    }
}
catch {
    Write-Host "No additional Node.js processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Development server cleanup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 