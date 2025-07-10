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