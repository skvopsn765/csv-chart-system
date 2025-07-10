import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JwtPayload {
  userId: number;
  username: string;
}

// 擴展 Request 介面以包含用戶信息
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// 認證中間件
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({
        error: '未提供認證 token'
      });
    }

    // 驗證 token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // 獲取用戶信息
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({
        error: '用戶不存在'
      });
    }

    // 將用戶信息添加到 request 對象
    req.user = user;
    next();

  } catch (error) {
    console.error('Token 驗證錯誤:', error);
    res.status(401).json({
      error: 'Token 無效或已過期'
    });
  }
};

// 可選的認證中間件（不強制要求 token）
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      const user = await User.findByPk(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // 如果 token 無效，繼續執行但不設置 user
    next();
  }
}; 