import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, AuthResponse, AuthError } from '../types/auth';
import { tokenManager, apiRequest, validateToken } from '../utils/auth';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化認證狀態
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = tokenManager.getToken();
      const savedUser = tokenManager.getUser();

      if (savedToken && savedUser) {
        // 驗證 token 是否仍然有效
        const isValid = await validateToken();
        if (isValid) {
          setToken(savedToken);
          setUser(savedUser);
        } else {
          // Token 無效，清除認證信息
          tokenManager.clearAuth();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 登入函數
  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData: AuthError = await response.json();
        throw new Error(errorData.error || '登入失敗');
      }

      const data: AuthResponse = await response.json();
      
      // 儲存認證信息
      tokenManager.setToken(data.token);
      tokenManager.setUser(data.user);
      
      // 更新狀態
      setToken(data.token);
      setUser(data.user);

      console.log('✅ 登入成功:', data.user.username);
    } catch (error) {
      console.error('❌ 登入失敗:', error);
      throw error;
    }
  };

  // 註冊函數
  const register = async (username: string, password: string): Promise<void> => {
    try {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData: AuthError = await response.json();
        throw new Error(errorData.error || '註冊失敗');
      }

      const data: AuthResponse = await response.json();
      
      // 儲存認證信息
      tokenManager.setToken(data.token);
      tokenManager.setUser(data.user);
      
      // 更新狀態
      setToken(data.token);
      setUser(data.user);

      console.log('✅ 註冊成功:', data.user.username);
    } catch (error) {
      console.error('❌ 註冊失敗:', error);
      throw error;
    }
  };

  // 登出函數
  const logout = (): void => {
    tokenManager.clearAuth();
    setToken(null);
    setUser(null);
    console.log('👋 已登出');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用認證上下文的 Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必須在 AuthProvider 內使用');
  }
  return context;
}; 