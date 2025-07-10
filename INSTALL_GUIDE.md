# TypeScript Dependencies Installation Guide

## 🚀 Automated Installation

### Option 1: PowerShell (Recommended for Windows)
```powershell
# Right-click and "Run with PowerShell"
.\install-dependencies.ps1
```

### Option 2: Command Prompt
```cmd
# Double-click or run in cmd
install-dependencies.bat
```

## 🔧 Manual Installation

If the automated scripts fail, use these manual commands:

### Frontend Dependencies
```bash
cd frontend
npm install @types/react @types/react-dom @types/node typescript
cd ..
```

### Backend Dependencies
```bash
cd backend
npm install @types/cors @types/express @types/multer @types/node @types/papaparse ts-node typescript
cd ..
```

## 🎯 Starting the Application

### Frontend (Port 3000)
```bash
cd frontend
npm start
```

### Backend (Port 5000)
```bash
cd backend
npm run dev
```

## 🛠️ Troubleshooting

### Common Issues

1. **npm not found**: Install Node.js from https://nodejs.org/
2. **Permission denied**: Run terminal as administrator
3. **Port already in use**: 
   - Frontend: Choose different port when prompted
   - Backend: Change PORT in backend/.env
4. **Chinese characters showing as ???**: Use install-dependencies.ps1 instead

### PowerShell Execution Policy
If you get execution policy error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Alternative Commands (PowerShell)
```powershell
# Frontend
Set-Location frontend
npm install @types/react @types/react-dom @types/node typescript
Set-Location ..

# Backend
Set-Location backend
npm install @types/cors @types/express @types/multer @types/node @types/papaparse ts-node typescript
Set-Location ..
```

## ✅ Verification

After installation, verify TypeScript is working:

```bash
# Check TypeScript version
npx tsc --version

# Check if files compile (frontend)
cd frontend
npx tsc --noEmit

# Check if files compile (backend)
cd backend
npx tsc --noEmit
```

## 📝 Notes

- Use separate terminal windows for frontend and backend
- Frontend runs on http://localhost:3000
- Backend runs on http://localhost:5000
- All original .js files have been converted to .ts/.tsx
- TypeScript configuration files (tsconfig.json) have been added 