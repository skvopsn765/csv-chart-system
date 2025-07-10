import React from 'react';
import { useAuth } from '../../../features/auth';
import './index.css';

export const UserInfo: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = (): void => {
    logout();
  };

  return (
    <div className="user-info">
      <div className="user-details">
        <div className="user-avatar">
          <span className="avatar-text">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
        <div className="user-text">
          <p className="username">歡迎，{user?.username}</p>
          <p className="user-status">已登入</p>
        </div>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        登出
      </button>
    </div>
  );
}; 