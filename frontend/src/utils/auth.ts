// Token 管理工具

const TOKEN_KEY = 'csv_chart_token';
const USER_KEY = 'csv_chart_user';

export const tokenManager = {
  // 儲存 token
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // 獲取 token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // 移除 token
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // 儲存用戶信息
  setUser: (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // 獲取用戶信息
  getUser: (): any | null => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // 移除用戶信息
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  // 清除所有認證信息
  clearAuth: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// API 請求工具
export const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = tokenManager.getToken();
  
  // 準備 headers
  const headers: Record<string, string> = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers as Record<string, string>)
  };

  // 只有在沒有 FormData 時才設置 Content-Type
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    ...options,
    headers
  });
};

// 驗證 token 是否有效
export const validateToken = async (): Promise<boolean> => {
  const token = tokenManager.getToken();
  if (!token) return false;

  try {
    const response = await apiRequest('/api/auth/me');
    return response.ok;
  } catch (error) {
    console.error('Token 驗證失敗:', error);
    return false;
  }
}; 