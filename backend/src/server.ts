import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import csvRoutes from './routes/csvRoutes';
import authRoutes from './routes/authRoutes';
import datasetRoutes from './routes/datasetRoutes';
// 資料庫相關 imports
import sequelize from './config/database';
import Upload from './models/Upload';
import User from './models/User';
import Dataset from './models/Dataset';
import DataRecord from './models/DataRecord';

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
app.use('/api/auth', authRoutes);
app.use('/api', csvRoutes);
app.use('/api', datasetRoutes);

// 健康檢查端點
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 根路徑
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'CSV 資料繪圖系統 API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      csv: {
        upload: 'POST /api/upload-csv',
        test: 'GET /api/test'
      },
      health: 'GET /health'
    }
  });
});

// 404 處理
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: '找不到請求的資源',
    path: req.originalUrl 
  });
});

// 全域錯誤處理
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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

// 資料庫初始化與伺服器啟動
async function startServer(): Promise<void> {
  try {
    // 測試資料庫連線
    await sequelize.authenticate();
    console.log('🗄️  資料庫連線成功');
    
    // 建立資料表 (相當於 .NET 的 EnsureCreated 或 Database.Migrate)
    await sequelize.sync({ force: false }); // force: false 表示不覆蓋現有資料
    console.log('📊 資料表建立完成');
    
    // 啟動伺服器
    app.listen(PORT, () => {
      console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
      console.log(`📝 環境: ${NODE_ENV}`);
      console.log(`📊 API 端點: http://localhost:${PORT}/api`);
      console.log(`🔐 認證端點: http://localhost:${PORT}/api/auth`);
      console.log(`🗄️  資料庫: SQLite (./data/uploads.db)`);
    });
    
  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    process.exit(1);
  }
}

// 啟動伺服器
startServer();

export default app; 