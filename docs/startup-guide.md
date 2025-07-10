# 🚀 CSV Chart System - Startup Guide

## ✅ System is Running!

### 📊 Service Status
- **Backend API**: http://localhost:5000 ✅ Running
- **Frontend App**: http://localhost:3000 ✅ Running

### 🔧 How to Use

1. **Open Browser**
   - Go to http://localhost:3000

2. **Upload CSV File**
   - Click "Choose CSV File" button
   - You can test with `sample-data.csv` first

3. **Select Chart Fields**
   - X-axis: Any field
   - Y-axis: Numeric fields (multiple selection allowed)

4. **View Charts**
   - Default: Line chart
   - Click button to switch to Bar chart

### 🛠️ Daily Development Startup

#### Method 1: Quick Start (Recommended)
```bash
# Double-click start-dev.bat file
```

#### Method 2: Manual Start
```bash
# Terminal 1 - Start Backend
cd backend
npm start

# Terminal 2 - Start Frontend
cd frontend
npm start
```

### 📋 Checklist

- ✅ Node.js installed
- ✅ Backend dependencies installed (`backend/node_modules`)
- ✅ Frontend dependencies installed (`frontend/node_modules`)
- ✅ Backend server running on port 5000
- ✅ Frontend app running on port 3000
- ✅ Sample file `sample-data.csv` available

### 🔍 Troubleshooting

**Q: Backend won't start**
```bash
cd backend
npm install
npm start
```

**Q: Frontend won't start**
```bash
cd frontend
npm install
npm start
```

**Q: Port already in use**
- Close other applications using ports 3000 or 5000
- Or modify PORT setting in `backend/server.js`

### 🎯 Test Features

1. **Backend API Test**
   - Health check: http://localhost:5000/health
   - API test: http://localhost:5000/api/test

2. **Frontend Feature Test**
   - Upload CSV file
   - Select fields
   - Switch chart types

### 📱 System Architecture

```
CSV Chart System
├── Frontend (React) - Port 3000
│   ├── File Upload
│   ├── Field Selection
│   └── Chart Display
└── Backend (Express) - Port 5000
    ├── CSV Parsing
    ├── Data Validation
    └── API Endpoints
```

---

🎉 **Congratulations! Your CSV Chart System is up and running!**

Now you can start uploading CSV files and creating beautiful charts! 