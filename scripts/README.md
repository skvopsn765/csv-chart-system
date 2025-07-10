# 🔧 執行腳本資料夾

本資料夾包含系統的執行腳本，用於快速安裝和啟動系統。

## 📄 腳本說明

### 安裝腳本
- `install-dependencies.bat` - Windows 批次檔，自動安裝前後端依賴
- `install-dependencies.ps1` - Windows PowerShell 腳本，自動安裝前後端依賴

### 啟動腳本
- `start-dev.bat` - Windows 批次檔，同時啟動前後端開發服務器

## 🚀 使用方法

### 首次安裝
```bash
# Windows 命令提示符
.\scripts\install-dependencies.bat

# Windows PowerShell
.\scripts\install-dependencies.ps1
```

### 日常開發
```bash
# 啟動開發服務器
.\scripts\start-dev.bat
```

## 📋 注意事項

- 執行腳本前請確認已安裝 Node.js 16.0.0 或更高版本
- 腳本會自動安裝依賴並編譯 TypeScript 代碼
- 啟動腳本會同時運行前端和後端服務器
- 如果遇到權限問題，請以管理員身份運行 