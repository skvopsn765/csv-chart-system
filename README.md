# CSV 資料繪圖系統

一個簡單易用的 CSV 資料視覺化系統，讓使用者上傳 CSV 檔案並即時生成圖表。

## 📋 功能特色

- 📊 **即時圖表生成** - 上傳 CSV 檔案後立即生成摺線圖或長條圖
- 🔄 **多軸選擇** - 支援選擇任意 X 軸和多個 Y 軸欄位
- 🎨 **圖表類型切換** - 支援摺線圖和長條圖兩種顯示方式
- 🔍 **智能數據判斷** - 自動識別數值欄位和文字欄位
- 🛡️ **安全檔案上傳** - 完整的檔案驗證和錯誤處理
- ⚡ **高效能處理** - 支援最多 5,000 筆資料的流暢渲染

## 🏗️ 技術架構

### 前端 (Frontend)
- **React 18** - 現代化的使用者介面
- **Recharts** - 高效能的圖表繪製庫
- **CSS3** - 響應式設計和現代化樣式

### 後端 (Backend)
- **Node.js + Express** - 輕量級 API 伺服器
- **Multer** - 檔案上傳處理
- **PapaParse** - CSV 檔案解析
- **Helmet** - 安全性中間件
- **CORS** - 跨域請求處理

## 🚀 快速開始

### 環境需求
- Node.js 16.0.0 或更高版本
- npm 或 yarn

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd csv-chart-system
   ```

2. **安裝後端依賴**
   ```bash
   cd backend
   npm install
   ```

3. **安裝前端依賴**
   ```bash
   cd ../frontend
   npm install
   ```

4. **啟動後端伺服器**
   ```bash
   cd ../backend
   npm run dev
   ```
   後端伺服器將在 http://localhost:5000 運行

5. **啟動前端應用**
   ```bash
   cd ../frontend
   npm start
   ```
   前端應用將在 http://localhost:3000 運行

## 📁 項目結構

```
csv-chart-system/
├── frontend/                 # React 前端應用
│   ├── public/
│   ├── src/
│   │   ├── components/       # React 組件
│   │   │   ├── CSVUploader.js
│   │   │   ├── FieldSelector.js
│   │   │   └── ChartDisplay.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── backend/                  # Node.js 後端 API
│   ├── routes/
│   │   └── csvRoutes.js
│   ├── server.js
│   └── package.json
├── sample-data.csv          # 範例數據檔案
├── .gitignore
└── README.md
```

## 🔧 使用方法

1. **上傳 CSV 檔案**
   - 點擊「選擇 CSV 檔案」按鈕
   - 選擇符合格式要求的 CSV 檔案
   - 系統會自動上傳並解析檔案

2. **選擇圖表欄位**
   - 從 X 軸下拉選單選擇一個欄位
   - 從 Y 軸複選框選擇一個或多個數值欄位
   - 系統會自動判斷欄位類型

3. **查看和切換圖表**
   - 預設顯示摺線圖
   - 點擊按鈕可切換為長條圖
   - 圖表會即時更新

## 📊 CSV 檔案格式要求

- **檔案格式**：.csv
- **檔案大小**：最大 10MB
- **資料筆數**：最大 5,000 筆
- **編碼格式**：UTF-8
- **第一行**：必須為欄位名稱
- **欄位限制**：最多 100 個欄位

### 範例 CSV 格式

```csv
日期,營收,成本,利潤
2024/01/01,1000,500,500
2024/01/02,1200,600,600
2024/01/03,900,450,450
```

## 🔒 安全性考量

- 檔案類型驗證
- 檔案大小限制
- 資料筆數限制
- CORS 設定
- 請求頻率限制
- 輸入資料清理

## 🐛 常見問題

### Q: 為什麼我的 CSV 檔案無法上傳？
A: 請檢查檔案是否符合格式要求（.csv 副檔名、UTF-8 編碼、第一行為欄位名稱）

### Q: 為什麼某些欄位無法選擇為 Y 軸？
A: Y 軸只能選擇數值欄位，系統會自動判斷欄位類型（需 70% 以上資料為數字）

### Q: 圖表顯示不完整怎麼辦？
A: 檢查資料中是否包含無效值，系統會自動將無效值轉換為 0

### Q: 如何修改檔案大小限制？
A: 修改 `backend/routes/csvRoutes.js` 中的 `MAX_FILE_SIZE` 常數

## 🔄 開發命令

### 後端開發
```bash
cd backend
npm run dev      # 使用 nodemon 啟動開發伺服器
npm start        # 啟動生產伺服器
npm test         # 執行測試
```

### 前端開發
```bash
cd frontend
npm start        # 啟動開發伺服器
npm run build    # 建構生產版本
npm test         # 執行測試
```

## 📝 API 端點

### POST /api/upload-csv
上傳 CSV 檔案並解析資料

**請求**：
- Method: POST
- Content-Type: multipart/form-data
- Body: csvFile (檔案)

**回應**：
```json
{
  "success": true,
  "message": "CSV 檔案上傳成功",
  "data": {
    "columns": ["日期", "營收", "成本", "利潤"],
    "rows": [
      {"日期": "2024/01/01", "營收": 1000, "成本": 500, "利潤": 500}
    ],
    "summary": {
      "totalRows": 1,
      "totalColumns": 4,
      "fileName": "data.csv",
      "fileSize": 1024
    }
  }
}
```

### GET /api/test
測試 API 連線狀態

### GET /health
健康檢查端點

## 🌟 未來擴充計畫

- [ ] 使用者登入系統
- [ ] 圖表匯出功能 (PNG/JPEG)
- [ ] 更多圖表類型 (圓餅圖、雷達圖)
- [ ] 響應式手機版介面
- [ ] 多語系支援
- [ ] 資料庫儲存功能
- [ ] 圖表客製化選項
- [ ] 資料預覽表格
- [ ] 批次檔案處理

## 📄 授權條款

MIT License

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request 來改善這個項目！

---

**開發者**: 您的團隊  
**版本**: 1.0.0  
**最後更新**: 2024 