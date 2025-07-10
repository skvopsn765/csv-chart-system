import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthPage from './AuthPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // 如果正在載入認證狀態，顯示載入畫面
  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>載入中...</h2>
            <p>正在驗證您的身份</p>
          </div>
        </div>
      </div>
    );
  }

  // 如果未認證，顯示登入頁面
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // 如果已認證，顯示受保護的內容
  return <>{children}</>;
};

export default ProtectedRoute; 