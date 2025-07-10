# 📊 CSV 圖表系統 (含認證功能)

一個功能完整的 CSV 數據可視化系統，具備用戶認證、文件上傳、圖表生成等功能。

## 🏗️ 系統架構

**前端**: React + TypeScript + Context API  
**後端**: Node.js + Express + TypeScript + SQLite + JWT  
**認證**: bcryptjs 密碼加密 + JWT Token 驗證  

---

## 🚀 安裝說明

### 系統需求
- **Node.js**: 16.0.0 或更高版本
- **npm**: 最新版本
- **瀏覽器**: 支持 ES6+ 的現代瀏覽器

### 方法一：使用安裝腳本 (推薦)
```bash
# Windows
.\scripts\install-dependencies.bat

# Windows PowerShell
.\scripts\install-dependencies.ps1
```

### 方法二：手動安裝
```bash
# 1. 克隆項目
git clone <repository-url>
cd csv-chart-system

# 2. 安裝後端依賴
cd backend
npm install

# 3. 安裝前端依賴  
cd ../frontend
npm install

# 4. 編譯後端 TypeScript
cd ../backend
npm run build
```

---

## 🎯 啟動說明

### 快速啟動
```bash
# 使用啟動腳本
.\scripts\start-dev.bat
```

### 手動啟動
```bash
# 1. 啟動後端服務器
cd backend
npm start

# 2. 啟動前端應用 (新終端)
cd frontend  
npm start
```

### 訪問地址
- **前端應用**: http://localhost:3000
- **後端 API**: http://localhost:5000
- **健康檢查**: http://localhost:5000/health

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

## 🔧 開發指令

### 後端
```bash
cd backend
npm run dev      # 開發模式 (nodemon)
npm start        # 生產模式
npm run build    # 編譯 TypeScript
npm test         # 執行測試
```

### 前端
```bash
cd frontend
npm start        # 開發模式
npm run build    # 生產版本
npm test         # 執行測試
```

---

## 🗂️ 專案結構

```
csv-chart-system/
├── scripts/                 # 執行腳本
│   ├── install-dependencies.bat
│   ├── install-dependencies.ps1
│   └── start-dev.bat
├── docs/                    # 文檔資料夾
│   ├── AUTHENTICATION_SYSTEM_SUMMARY.md
│   ├── QUICK_START_GUIDE.md
│   └── ... (其他文檔)
├── frontend/                # React 前端
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── contexts/       # 認證上下文
│   │   ├── utils/          # 工具函數
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
└── README.md              # 主要文檔
```

---

## 🎉 測試建議

### 測試帳戶
- 用戶名: `testuser`
- 密碼: `123456`

### 測試流程
1. 使用測試帳戶登入
2. 上傳 `sample-data.csv` 文件
3. 選擇字段創建圖表
4. 切換圖表類型
5. 查看資料頁籤
6. 登出再重新登入測試

---

## 🐛 常見問題

**Q: 無法啟動系統？**  
A: 確認 Node.js 版本 >= 16.0.0，並完成依賴安裝

**Q: 無法登入？**  
A: 檢查用戶名/密碼，確認後端服務器正在運行

**Q: 無法上傳文件？**  
A: 確認已登入，檢查 CSV 格式和文件大小

**Q: 圖表不顯示？**  
A: 確認選擇了 X 軸和至少一個 Y 軸字段

**Q: 字段無法選擇？**  
A: Y 軸只能選擇數字字段（需 70%+ 數據為數字）

---

## 📚 詳細文檔

更多詳細信息請查看 `docs/` 資料夾中的文檔：
- 認證系統詳細說明
- 升級記錄
- 安裝故障排除
- 快速使用指南

---

## 🎊 開始使用

系統已完成安裝和配置，現在您可以：
1. 執行 `.\scripts\start-dev.bat` 啟動系統
2. 訪問 http://localhost:3000 開始使用
3. 享受安全的 CSV 圖表創建體驗！ 