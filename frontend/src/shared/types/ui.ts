// UI 相關類型定義

import React from 'react';

// 頁籤相關類型
export interface TabProps {
  title: string;
  children: React.ReactNode;
}

export interface TabPanelProps {
  children: React.ReactElement<TabProps>[];
  defaultTab?: number;
}

// 通用按鈕屬性
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// 載入狀態屬性
export interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

// 錯誤訊息屬性
export interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
} 