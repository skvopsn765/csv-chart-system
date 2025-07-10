import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthPage } from '../AuthPage';
import { ProtectedRouteProps } from '../../types/auth';

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>載入中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <>{children}</>;
}; 