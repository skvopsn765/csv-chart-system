# 環境配置說明

## React 環境配置系統

React 使用 `.env` 文件來管理環境變量，這類似於 Angular 的 `environments` 文件夾。

### 📁 環境文件結構

```
frontend/
├── .env                    # 基礎配置 (所有環境的預設值)
├── .env.development       # 開發環境配置 (覆蓋基礎配置)
├── .env.production        # 生產環境配置 (覆蓋基礎配置)
├── .env.local             # 本地配置 (覆蓋所有環境，被 git 忽略)
└── .env.example           # 環境變量範例文件
```

### 🔄 優先級順序

1. `.env.development.local` (開發環境本地覆蓋)
2. `.env.local` (本地覆蓋，除了 test 環境)
3. `.env.development` (開發環境)
4. `.env` (基礎配置)

### 🚀 使用方式

#### 1. 複製範例文件

```bash
# 複製範例文件為基礎配置
cp .env.example .env

# 複製為開發環境配置
cp .env.example .env.development

# 複製為生產環境配置
cp .env.example .env.production
```

#### 2. 修改對應環境的設定

**`.env` (基礎配置)**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_APP_NAME=CSV Chart System
REACT_APP_DEBUG=false
```

**`.env.development` (開發環境)**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_APP_NAME=CSV Chart System (開發)
REACT_APP_DEBUG=true
REACT_APP_API_TIMEOUT=60000
```

**`.env.production` (生產環境)**
```env
REACT_APP_API_URL=https://csv-chart-system-backend.onrender.com
REACT_APP_APP_NAME=CSV Chart System
REACT_APP_DEBUG=false
REACT_APP_API_TIMEOUT=30000
```

### ⚡ 在程式碼中使用

```typescript
import { ENV_CONFIG } from './shared/constants/api';

// 取得 API URL
const apiUrl = ENV_CONFIG.API_BASE_URL;

// 檢查是否為開發環境
if (ENV_CONFIG.IS_DEVELOPMENT) {
  console.log('開發模式');
}

// 使用環境變量
const appName = ENV_CONFIG.APP_NAME;
const isDebug = ENV_CONFIG.DEBUG;
```

### 📋 重要規則

1. **必須以 `REACT_APP_` 開頭** - 這是 React 的安全機制
2. **不要將 `.env.local` 加入版本控制** - 它包含本地設定
3. **使用 `.env.example` 作為範本** - 方便其他開發者設定
4. **重啟開發伺服器** - 修改環境變量後需要重啟才生效

### 🔧 與 Angular 的對比

| Angular | React |
|---------|--------|
| `environments/environment.ts` | `.env` |
| `environments/environment.development.ts` | `.env.development` |
| `environments/environment.production.ts` | `.env.production` |
| `environment.apiUrl` | `process.env.REACT_APP_API_URL` |

這樣的設計讓 React 的環境管理與 Angular 一樣簡單且強大！ 