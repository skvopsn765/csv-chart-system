import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserInfo.css';

const UserInfo: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    if (window.confirm('確定要登出嗎？')) {
      logout();
    }
  };

  return (
    <div className="user-info">
      <div className="user-details">
        <span className="user-icon">👤</span>
        <span className="username">{user.username}</span>
      </div>
      <button 
        className="logout-button"
        onClick={handleLogout}
        title="登出"
      >
        登出
      </button>
    </div>
  );
};

export default UserInfo; 