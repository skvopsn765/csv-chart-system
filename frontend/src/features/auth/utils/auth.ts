// 認證工具函數

import { STORAGE_KEYS, API_ENDPOINTS } from '../../../shared/constants';
import { User } from '../types/auth';

// Token 管理工具
export const tokenManager = {
  // 儲存 token
  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  // 獲取 token
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // 移除 token
  removeToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // 儲存用戶信息
  setUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // 獲取用戶信息
  getUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  // 移除用戶信息
  removeUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // 清除所有認證信息
  clearAuth: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

// API 請求工具
export const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = tokenManager.getToken();
  
  // 設定 API base URL
  const baseURL = process.env.NODE_ENV === 'production' 
    ? '' // 生產環境使用相對路徑，透過 Vercel 代理到 Render
    : process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
  
  // 準備 headers
  const headers: Record<string, string> = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers as Record<string, string>)
  };

  // 只有在沒有 FormData 時才設置 Content-Type
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(fullUrl, {
    ...options,
    headers
  });
};

// 驗證 token 是否有效
export const validateToken = async (): Promise<boolean> => {
  const token = tokenManager.getToken();
  if (!token) return false;

  try {
    const response = await apiRequest(API_ENDPOINTS.AUTH.ME);
    return response.ok;
  } catch (error) {
    console.error('Token 驗證失敗:', error);
    return false;
  }
}; 