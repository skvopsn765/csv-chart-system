# CSV Chart System - Installation Guide

## 🔧 System Requirements

- **Node.js** 16.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** (for version control)
- **Modern Browser** (Chrome, Firefox, Safari, Edge)

## 📦 Installation Steps

### 1. Clone Project
```bash
git clone <repository-url>
cd csv-chart-system
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### 3. Start Development Servers

#### Method 1: Quick Start Script (Recommended)
```bash
# Windows: Double-click start-dev.bat file
```

#### Method 2: Manual Start
```bash
# Backend server (Terminal 1)
cd backend
npm run dev

# Frontend app (Terminal 2)
cd frontend
npm start
```

### 4. Open Browser
- Frontend app: http://localhost:3000
- Backend API: http://localhost:5000

## 🚀 Quick Start (Windows)

Double-click the `start-dev.bat` file in the project root to automatically start both frontend and backend servers.

## 📊 System Testing

### 1. Backend API Test
```bash
# Health check
curl http://localhost:5000/health

# API test
curl http://localhost:5000/api/test
```

### 2. Frontend Feature Test
1. Open http://localhost:3000
2. Upload `sample-data.csv` file
3. Select X-axis and Y-axis fields
4. Check if charts display correctly

## 🛠️ Troubleshooting

### Common Issues

1. **Node.js version too old**
   ```bash
   node --version  # Check version
   ```
   - Please upgrade to Node.js 16.0.0 or higher

2. **Port already in use**
   - Backend uses port 5000 by default
   - Frontend uses port 3000 by default
   - Close other applications using these ports or modify settings

3. **Dependency installation failed**
   ```bash
   # Clear cache
   npm cache clean --force
   
   # Reinstall
   rm -rf backend/node_modules frontend/node_modules
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. **CORS errors**
   - Make sure backend server is running
   - Check frontend proxy settings

5. **File upload failed**
   - Check CSV file format is correct
   - Confirm file size doesn't exceed 10MB

## 🏭 Production Deployment

### Build Applications
```bash
# Build frontend
cd frontend
npm run build

# Build backend (if needed)
cd ../backend
npm run build
```

### Start Production Server
```bash
# Start backend production server
cd backend
npm start

# Frontend files need to be served via nginx or other web server
```

### Environment Variables
```bash
# Backend
NODE_ENV=production
PORT=5000

# Frontend
REACT_APP_API_URL=https://your-api-domain.com
```

## 🔄 Development Commands

```bash
# Backend
cd backend
npm run dev      # Development mode
npm start        # Production mode
npm test         # Run tests

# Frontend
cd frontend
npm start        # Development mode
npm run build    # Build production version
npm test         # Run tests
```

## 📁 File Structure

```
csv-chart-system/
├── backend/                  # Backend API server
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/                 # Frontend React app
│   ├── src/
│   ├── public/
│   └── package.json
├── start-dev.bat            # Windows quick start script
├── sample-data.csv          # Sample data file
└── README.md
```

## 🔍 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/test` | GET | API test |
| `/api/upload-csv` | POST | Upload CSV file |

## 🆘 Support

If you have issues:
1. Check this installation guide
2. Review [README.md](README.md) for common questions
3. Submit an Issue to the project repository

---

📝 **Last Updated**: 2024  
🔧 **Supported Platforms**: Windows, macOS, Linux 