# 📊 CSV 圖表系統 (含認證功能)

一個功能完整的 CSV 數據可視化系統，具備用戶認證、文件上傳、圖表生成等功能。

## 🏗️ 系統架構

**前端**: React + TypeScript + Context API  
**後端**: Node.js + Express + TypeScript + SQLite + JWT  
**認證**: bcryptjs 密碼加密 + JWT Token 驗證  
**環境管理**: env-cmd 支援多環境配置

---

## 🚀 快速開始

### 系統需求
- **Node.js**: 16.0.0 或更高版本
- **npm**: 最新版本
- **瀏覽器**: 支持 ES6+ 的現代瀏覽器

### 一鍵安裝與啟動
```bash
# Windows 用戶
.\scripts\install-dependencies.bat
.\scripts\start-dev.bat

# PowerShell 用戶
.\scripts\install-dependencies.ps1
.\scripts\start-dev.bat
```

### 手動安裝
```bash
# 1. 克隆項目
git clone <repository-url>
cd csv-chart-system

# 2. 安裝後端依賴
cd backend && npm install

# 3. 安裝前端依賴  
cd ../frontend && npm install

# 4. 編譯後端 TypeScript
cd ../backend && npm run build
```

### 訪問地址
- **前端應用**: http://localhost:3000
- **後端 API**: http://localhost:5000
- **健康檢查**: http://localhost:5000/health

---

## 🔧 環境配置

### 環境文件結構
```
frontend/
├── config/
│   └── environments/
│       ├── .env                # 基礎配置
│       ├── .env.development   # 開發環境
│       ├── .env.production    # 生產環境
│       └── .env.example       # 範例文件
```

### 環境變量設置
每個環境文件包含以下變量：
```env
# API 設定
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=30000

# 應用程式設定
REACT_APP_APP_NAME=CSV Chart System
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false

# 檔案上傳設定
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_MAX_ROWS=5000
```

### 環境配置規則
1. **必須以 `REACT_APP_` 開頭** - React 安全機制
2. **優先級順序**: `.env.development` → `.env` → 預設值
3. **重啟開發服務器** - 修改環境變量後需要重啟才生效

---

## 🛠️ 開發指令

### 後端指令
```bash
cd backend
npm run dev      # 開發模式 (nodemon)
npm start        # 生產模式
npm run build    # 編譯 TypeScript
npm test         # 執行測試
```

### 前端指令
```bash
cd frontend
npm start              # 開發模式 (使用 .env.development)
npm run build          # 生產版本 (使用 .env.production)
npm test               # 執行測試

# 環境特定指令
npm run start:dev      # 開發環境
npm run start:prod     # 生產環境
npm run build:dev      # 開發環境建置
npm run build:prod     # 生產環境建置
```

---

## 📋 腳本工具

### 安裝腳本
```bash
# Windows
.\scripts\install-dependencies.bat

# PowerShell
.\scripts\install-dependencies.ps1
```

### 啟動腳本
```bash
# 啟動開發環境
.\scripts\start-dev.bat
```

### 停止服務腳本
當需要停止 Port 3000 (前端) 和 Port 5000 (後端) 的進程時：
```bash
# 擇一執行
.\scripts\stop-dev-ports.ps1      # PowerShell
.\scripts\stop-dev-ports.bat      # Batch (如果存在)
```

### 腳本功能
- ✅ **智能檢測**: 自動檢測 Port 3000 和 5000 上的進程
- 🔍 **詳細輸出**: 顯示找到的進程 PID 和名稱
- 🧹 **徹底清理**: 額外清理殘留的 Node.js 進程
- 🎨 **友好界面**: 彩色輸出和清晰狀態指示
- ⚡ **安全終止**: 強制終止卡住的進程

---

## 🔧 功能說明

### 🔐 認證系統
- **用戶註冊**: 創建新帳戶，密碼 bcryptjs 加密
- **用戶登入**: JWT Token 認證，7 天有效期
- **自動登入**: 持久化登入狀態，關閉瀏覽器後仍保持登入
- **安全登出**: 清除所有認證信息
- **路由保護**: 未登入自動跳轉到登入頁面

### 📊 圖表功能
- **CSV 上傳**: 支持最大 10MB，5,000 行數據
- **智能解析**: 自動識別數字型和文字型字段
- **多軸選擇**: 支持選擇 X 軸和多個 Y 軸字段
- **圖表切換**: 支持折線圖和長條圖
- **即時渲染**: 選擇字段後即時生成圖表

### 🛡️ 安全特性
- **文件驗證**: 檔案類型、大小、格式驗證
- **API 保護**: 所有 CSV 操作需要認證
- **密碼安全**: bcryptjs 加密存儲
- **Token 管理**: 自動過期檢查和刷新
- **CORS 配置**: 跨域請求安全設置

### 🎨 用戶界面
- **現代設計**: 美觀的 UI 界面
- **響應式**: 支持桌面和手機瀏覽器
- **用戶友好**: 清晰的錯誤提示和成功信息
- **頁籤切換**: 圖表和數據表頁籤瀏覽

---

## 📋 使用流程

### 1. 首次使用
1. 訪問 http://localhost:3000
2. 點擊「立即註冊」創建帳戶
3. 輸入用戶名和密碼（至少 3 個字符）
4. 註冊成功後自動登入

### 2. 上傳 CSV 文件
1. 點擊「選擇 CSV 檔案」
2. 選擇符合格式要求的 CSV 文件
3. 系統自動上傳和解析

### 3. 創建圖表
1. 從 X 軸下拉選單選擇一個字段
2. 從 Y 軸複選框選擇一個或多個數字字段
3. 圖表自動生成
4. 點擊按鈕切換圖表類型

### 4. 查看資料
1. 點擊「資料」頁籤
2. 瀏覽完整的數據表格

---

## 📄 CSV 格式要求

- **檔案格式**: .csv
- **檔案大小**: 最大 10MB
- **數據筆數**: 最大 5,000 筆
- **欄位數量**: 最大 100 個欄位
- **編碼**: UTF-8
- **首行**: 必須為欄位名稱

### 範例格式
```csv
日期,營收,成本,利潤
2024/01/01,1000,500,500
2024/01/02,1200,600,600
2024/01/03,900,450,450
```

---

## 🗂️ 專案結構

```
csv-chart-system/
├── scripts/                 # 執行腳本
│   ├── install-dependencies.bat
│   ├── install-dependencies.ps1
│   └── start-dev.bat
├── docs/                    # 歷史文檔與詳細說明
│   ├── AUTHENTICATION_SYSTEM_SUMMARY.md
│   ├── TYPESCRIPT_UPGRADE_SUMMARY.md
│   └── ... (技術實現詳情)
├── frontend/                # React 前端
│   ├── config/
│   │   └── environments/   # 環境配置文件
│   │       ├── .env
│   │       ├── .env.development
│   │       ├── .env.production
│   │       └── .env.example
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── features/       # 功能模組
│   │   │   └── auth/       # 認證功能
│   │   ├── shared/         # 共用組件與工具
│   │   └── types/          # TypeScript 類型
│   └── package.json
├── backend/                 # Node.js 後端
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── models/         # 數據模型
│   │   ├── middleware/     # 中間件
│   │   └── config/         # 配置
│   └── package.json
├── sample-data.csv         # 範例數據
├── vercel.json             # Vercel 部署配置
└── README.md              # 主要文檔 (本文件)
```

---

## 🚀 部署說明

### Vercel 部署
項目已配置 Vercel 自動部署：
- **建置指令**: `npm run build:prod`
- **環境變量**: 使用 `config/environments/.env.production`
- **自動部署**: 推送到 main 分支時自動部署

### 環境變量管理
- **開發環境**: `frontend/config/environments/.env.development`
- **生產環境**: `frontend/config/environments/.env.production`
- **本地覆蓋**: `frontend/config/environments/.env.local` (被 git 忽略)

---

## 🔧 故障排除

### 執行權限問題
如果 PowerShell 腳本無法執行，以管理員權限運行：
```powershell
Set-ExecutionPolicy RemoteSigned -CurrentUser
```

### 常見問題
- **無法啟動系統？** 確認 Node.js 版本 >= 16.0.0，完成依賴安裝
- **無法登入？** 檢查用戶名/密碼，確認後端服務器正在運行
- **無法上傳文件？** 確認已登入，檢查 CSV 格式和文件大小
- **圖表不顯示？** 確認選擇了 X 軸和至少一個 Y 軸字段
- **字段無法選擇？** Y 軸只能選擇數字字段（需 70%+ 數據為數字）

### 手動檢查端口使用
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# 手動終止進程
taskkill /PID <PID> /F
```

---

## 📚 詳細文檔

`docs/` 資料夾包含詳細的技術文檔：
- **認證系統實現** - 詳細的技術架構說明
- **TypeScript 升級記錄** - 從 JavaScript 遷移的完整記錄
- **安裝故障排除** - 深入的安裝問題解決方案

---

## 🔄 更新日誌

### v1.1.0 - 環境配置重構 (2024-01-12)
- ✅ 新增多環境配置支援
- ✅ 環境文件統一管理於 `config/environments/`
- ✅ 使用 `env-cmd` 取代 `cross-env`
- ✅ 整合所有 README 文檔
- ✅ 簡化項目結構

### v1.0.0 - 初始版本
- ✅ 完整的 CSV 上傳與圖表生成功能
- ✅ JWT 認證系統
- ✅ React + TypeScript 前端
- ✅ Node.js + Express 後端
- ✅ 自動部署配置

---

## 🎊 開始使用

系統已完成配置，現在您可以：

1. **快速啟動**: `.\scripts\start-dev.bat`
2. **訪問應用**: http://localhost:3000
3. **開始體驗**: 註冊帳戶並上傳 CSV 文件！

享受安全便捷的 CSV 圖表創建體驗！ 🚀 