# 📋 Script Tools

This directory contains commonly used script tools to help simplify the development process.

## 🛠️ Installation and Startup Scripts

### Windows Batch Scripts
- `install-dependencies.bat` - Install frontend and backend dependencies
- `start-dev.bat` - Start development environment

### PowerShell Scripts
- `install-dependencies.ps1` - Install frontend and backend dependencies

## 🔄 Server Management Scripts

### Stop Development Servers

When you need to stop processes running on Port 3000 (frontend) and Port 5000 (backend), you can use the following scripts:

#### 1. Windows Batch Script (.bat)
```bash
# Double-click to execute
./scripts/kill-dev-ports.bat
```

#### 2. PowerShell Script (.ps1)
```powershell
# Execute in PowerShell
./scripts/kill-dev-ports.ps1

# Or right-click file and select "Run with PowerShell"
```

#### 3. Shell Script (.sh) - Compatible with Git Bash
```bash
# Execute in Git Bash
chmod +x ./scripts/kill-dev-ports.sh
./scripts/kill-dev-ports.sh
```

### Script Features

All server cleanup scripts include the following features:

- ✅ **Smart Detection**: Automatically detect processes running on Port 3000 and 5000
- 🔍 **Detailed Output**: Display found process PID and names
- 🧹 **Thorough Cleanup**: Additional cleanup of remaining Node.js processes
- 🎨 **Friendly Interface**: Colored output and clear status indicators
- ⚡ **Safe Termination**: Force terminate stuck processes

### Use Cases

- When development servers are unresponsive
- Clean environment before switching Git branches
- Resolve port-in-use issues
- Cleanup before restarting development environment

## 📝 Usage Instructions

### System Requirements
- Windows 10 or higher
- Node.js 16.0.0 or higher
- npm or yarn package manager

### Execution Permissions
If PowerShell scripts cannot execute, run the following command with administrator privileges:
```powershell
Set-ExecutionPolicy RemoteSigned -CurrentUser
```

### Troubleshooting
If scripts don't work properly:
1. Ensure running with administrator privileges
2. Check if antivirus software is blocking
3. Confirm Node.js processes are actually running
4. Manually check port usage: `netstat -ano | findstr :3000`

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   # Windows
   ./scripts/install-dependencies.bat
   
   # PowerShell
   ./scripts/install-dependencies.ps1
   ```

2. **Start Development Environment**:
   ```bash
   ./scripts/start-dev.bat
   ```

3. **Stop Development Servers**:
   ```bash
   # Choose one of the following
   ./scripts/kill-dev-ports.bat
   ./scripts/kill-dev-ports.ps1
   ./scripts/kill-dev-ports.sh
   ```

## 💡 Tips

- Recommend executing these scripts from the project root directory
- All scripts will display execution results and status
- If permission issues occur, run with administrator privileges
- Scripts will pause after completion, press any key to continue 