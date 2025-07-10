// 認證相關類型定義

import React from 'react';

export interface User {
  id: number;
  username: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthError {
  error: string;
  details?: string;
}

// 認證相關組件屬性
export interface LoginProps {
  onSwitchToRegister: () => void;
}

export interface RegisterProps {
  onSwitchToLogin: () => void;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
} 