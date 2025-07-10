// API 相關常數定義

// API 端點
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me'
  },
  CSV: {
    UPLOAD: '/api/upload-csv'
  }
} as const;

// 本地儲存鍵名
export const STORAGE_KEYS = {
  TOKEN: 'csv_chart_token',
  USER: 'csv_chart_user'
} as const;

// 檔案上傳限制
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_ROWS: 5000,
  ALLOWED_EXTENSIONS: ['.csv'],
  ALLOWED_MIME_TYPES: [
    'text/csv',
    'application/vnd.ms-excel',
    'text/plain'
  ]
} as const; 