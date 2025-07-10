const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csvRoutes = require('./routes/csvRoutes');

const app = express();

// 伺服器設定常數
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 安全性中間件
app.use(helmet());

// 限流設定
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100, // 限制每個IP每15分鐘最多100次請求
  message: {
    error: '請求過於頻繁，請稍後再試'
  }
});

app.use('/api/', limiter);

// CORS 設定
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // 生產環境時設定實際域名
    : ['http://localhost:3000', 'http://127.0.0.1:3000'], // 開發環境
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 解析 JSON 請求體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 路由設定
app.use('/api', csvRoutes);

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 根路徑
app.get('/', (req, res) => {
  res.json({ 
    message: 'CSV 資料繪圖系統 API',
    version: '1.0.0',
    endpoints: {
      upload: 'POST /api/upload-csv',
      health: 'GET /health'
    }
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: '找不到請求的資源',
    path: req.originalUrl 
  });
});

// 全域錯誤處理
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  
  // 檔案上傳錯誤
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: '檔案大小超過限制',
      maxSize: '10MB'
    });
  }
  
  // 其他錯誤
  res.status(500).json({
    error: NODE_ENV === 'production' ? '伺服器內部錯誤' : err.message
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
  console.log(`📝 環境: ${NODE_ENV}`);
  console.log(`📊 API 端點: http://localhost:${PORT}/api`);
});

module.exports = app; 