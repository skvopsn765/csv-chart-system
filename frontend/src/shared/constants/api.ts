// API 相關常數定義

// 環境配置 (使用 React 的環境變量系統)
// React 會根據 NODE_ENV 自動載入對應的 .env 文件
export const ENV_CONFIG = {
  // API 設定
  API_BASE_URL: process.env.REACT_APP_API_URL!,
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  
  // 應用程式設定
  APP_NAME: process.env.REACT_APP_APP_NAME!,
  VERSION: process.env.REACT_APP_VERSION!,
  DEBUG: process.env.REACT_APP_DEBUG === 'true',
  
  // 檔案上傳設定
  MAX_FILE_SIZE: parseInt(process.env.REACT_APP_MAX_FILE_SIZE || '10485760'),
  MAX_ROWS: parseInt(process.env.REACT_APP_MAX_ROWS || '5000'),
  
  // 環境檢查
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production'
} as const;

// API 端點
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me'
  },
  CSV: {
    UPLOAD: '/api/upload-csv',
    CHECK_DUPLICATES: '/api/check-duplicates',
    UPLOADS: '/api/uploads'
  },
  DATASETS: {
    LIST: '/api/datasets',
    CREATE: '/api/datasets',
    DETAIL: '/api/datasets/:id',
    UPDATE: '/api/datasets/:id',
    DELETE: '/api/datasets/:id',
    CHECK_DUPLICATES: '/api/datasets/:id/check-duplicates',
    PARTIAL_UPLOAD: '/api/datasets/:id/partial-upload',
    CHECK_COLUMNS: '/api/datasets/check-columns'
  },
  RECORDS: {
    GET: '/api/records/:id',
    UPDATE: '/api/records/:id',
    DELETE: '/api/records/:id'
  },
  AIMTRAINER: {
    UPLOAD: '/api/aimtrainer/upload',
    RECORDS: '/api/aimtrainer/records',
    STATISTICS: '/api/aimtrainer/statistics',
    DELETE_RECORD: '/api/aimtrainer/records/:id'
  }
} as const;

// 本地儲存鍵名
export const STORAGE_KEYS = {
  TOKEN: 'csv_chart_token',
  USER: 'csv_chart_user'
} as const;

// 檔案上傳限制
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: ENV_CONFIG.MAX_FILE_SIZE,
  MAX_ROWS: ENV_CONFIG.MAX_ROWS,
  ALLOWED_EXTENSIONS: ['.csv'],
  ALLOWED_MIME_TYPES: [
    'text/csv',
    'application/vnd.ms-excel',
    'text/plain',
    '' // 空字串也是有效的 MIME 類型
  ]
} as const; 