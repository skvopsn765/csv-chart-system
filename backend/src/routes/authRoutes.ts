import express, { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

// JWT 密鑰（在生產環境中應該使用環境變數）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

// 介面定義
interface AuthRequest extends Request {
  body: {
    username: string;
    password: string;
  };
}

interface JwtPayload {
  userId: number;
  username: string;
}

// 生成 JWT Token
const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    userId: user.id,
    username: user.username
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
};

// POST /api/auth/register - 用戶註冊
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    // 驗證輸入
    if (!username || !password) {
      return res.status(400).json({
        error: '請提供用戶名和密碼'
      });
    }

    // 檢查用戶是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({
        error: '用戶名已存在'
      });
    }

    // 創建新用戶
    const user = await User.create({
      username,
      password // 密碼會在模型的 hook 中自動加密
    });

    // 生成 JWT Token
    const token = generateToken(user);

    console.log(`👤 新用戶註冊成功: ${username}`);

    res.status(201).json({
      success: true,
      message: '註冊成功',
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    console.error('用戶註冊錯誤:', error);
    res.status(500).json({
      error: '註冊失敗',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

// POST /api/auth/login - 用戶登入
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    // 驗證輸入
    if (!username || password === undefined) {
      return res.status(400).json({
        error: '請提供用戶名和密碼'
      });
    }

    // 查找用戶
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        error: '用戶名或密碼錯誤'
      });
    }

    // 驗證密碼
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: '用戶名或密碼錯誤'
      });
    }

    // 生成 JWT Token
    const token = generateToken(user);

    console.log(`🔐 用戶登入成功: ${username}`);

    res.json({
      success: true,
      message: '登入成功',
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    console.error('用戶登入錯誤:', error);
    res.status(500).json({
      error: '登入失敗',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

// GET /api/auth/me - 獲取當前用戶信息（需要 token）
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: '未提供認證 token'
      });
    }

    // 驗證 token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({
        error: '用戶不存在'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('獲取用戶信息錯誤:', error);
    res.status(401).json({
      error: 'Token 無效'
    });
  }
});

export default router; 