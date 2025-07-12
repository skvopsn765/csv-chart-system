# 🚀 Vercel + Render 免費部署指南

## 📋 部署概述

- **前端**: Vercel 靜態網站托管（完全免費）
- **後端**: Render Web Service（750小時/月免費）
- **資料庫**: Render PostgreSQL（90天免費）

## 🛠️ 部署前準備

### 1. 確保程式碼已推送到 GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. 安裝必要的依賴
```bash
# 根目錄
npm install

# 後端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

## 🔧 第一步：部署後端到 Render

### 1. 訪問 [Render](https://render.com/) 並註冊帳號

### 2. 連接 GitHub 儲存庫
- 點擊「New」→「Web Service」
- 連接您的 GitHub 帳號
- 選擇您的 csv-chart-system 儲存庫

### 3. 配置 Web Service
```
Name: csv-chart-backend
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### 4. 設定環境變數
```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-here
```

### 5. 創建 PostgreSQL 資料庫
- 在 Render Dashboard，點擊「New」→「PostgreSQL」
- 設定：
  ```
  Name: csv-chart-db
  Database: csv_chart_system
  User: csv_chart_user
  Plan: Free
  ```

### 6. 連接資料庫到 Web Service
- 在 Web Service 的環境變數中添加：
  ```
  DATABASE_URL=Internal Connection String（從 PostgreSQL 服務複製）
  ```

### 7. 部署
- 點擊「Deploy」
- 等待部署完成
- 記錄您的後端 URL：`https://your-backend-app.onrender.com`

## 🌐 第二步：部署前端到 Vercel

### 1. 訪問 [Vercel](https://vercel.com/) 並註冊帳號

### 2. 匯入 GitHub 儲存庫
- 點擊「New Project」
- 選擇您的 csv-chart-system 儲存庫
- 點擊「Import」

### 3. 配置專案設定
```
Framework Preset: Create React App
Root Directory: frontend
Build Command: npm run build
Output Directory: build
```

### 4. 更新 Vercel 配置
在 `vercel.json` 中，將 `your-backend-app.onrender.com` 替換為您的實際 Render 後端 URL

### 5. 部署
- 點擊「Deploy」
- 等待部署完成
- 記錄您的前端 URL：`https://your-frontend-app.vercel.app`

## 🔧 第三步：更新 CORS 設定

### 1. 更新後端 CORS 設定
在 `backend/src/server.ts` 中，將 `your-frontend-app.vercel.app` 替換為您的實際 Vercel 域名

### 2. 推送變更
```bash
git add .
git commit -m "Update CORS settings for production"
git push origin main
```

Render 會自動重新部署

## ✅ 驗證部署

### 1. 測試後端
訪問：`https://your-backend-app.onrender.com/health`
應該看到：
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. 測試前端
訪問：`https://your-frontend-app.vercel.app`
應該能看到登入頁面

### 3. 測試完整功能
- 註冊新帳號
- 登入系統
- 上傳 CSV 檔案
- 查看圖表

## 🎯 常見問題

### Q: 後端服務啟動失敗
**A:** 檢查環境變數設定，特別是 `DATABASE_URL` 和 `JWT_SECRET`

### Q: 前端無法連接後端
**A:** 確認 `vercel.json` 中的後端 URL 正確

### Q: 資料庫連接失敗
**A:** 確認 PostgreSQL 服務正在運行，並且 `DATABASE_URL` 正確

### Q: CORS 錯誤
**A:** 確認後端 CORS 設定包含正確的前端域名

## 🔄 更新部署

### 更新後端
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Render 會自動重新部署

### 更新前端
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel 會自動重新部署

## 💰 費用說明

### 免費額度
- **Vercel**: 前端托管完全免費
- **Render**: 後端 750 小時/月免費（約 31 天 24/7）
- **PostgreSQL**: 90 天免費，之後 $7/月

### 節省成本技巧
- 使用 Render 的 Sleep 功能（15分鐘無活動後自動休眠）
- 考慮使用 Supabase 免費 PostgreSQL（500MB 永久免費）

## 🎉 完成！

您的 CSV 圖表系統現在已經部署到網路上，完全免費！

訪問您的應用程式：`https://your-frontend-app.vercel.app` 