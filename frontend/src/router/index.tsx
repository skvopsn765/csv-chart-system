import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { DataUploadPage } from '../pages/DataUploadPage';
import { DataTablePage } from '../pages/DataTablePage';
import { ChartAnalysisPage } from '../pages/ChartAnalysisPage';
import { DatasetManagementPage } from '../pages/DatasetManagementPage';
import { AuthPage } from '../features/auth/components/AuthPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: <HomePage />,
      },
      {
        path: 'data-upload',
        element: <DataUploadPage />,
      },
      {
        path: 'data-table',
        element: <DataTablePage />,
      },
      {
        path: 'chart-analysis',
        element: <ChartAnalysisPage />,
      },
      {
        path: 'dataset-management',
        element: <DatasetManagementPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/home" replace />,
  },
]);

// 導航選單配置
export interface NavMenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  description?: string;
}

export const navigationMenuItems: NavMenuItem[] = [
  {
    key: 'home',
    label: '首頁',
    icon: '🏠',
    path: '/home',
    description: '系統首頁和總覽'
  },
  {
    key: 'data-upload',
    label: '資料上傳',
    icon: '📤',
    path: '/data-upload',
    description: '上傳 CSV 檔案'
  },
  {
    key: 'data-table',
    label: '資料表格',
    icon: '📊',
    path: '/data-table',
    description: '查看和編輯資料表格'
  },
  {
    key: 'chart-analysis',
    label: '圖表分析',
    icon: '📈',
    path: '/chart-analysis',
    description: '建立和分析圖表'
  },
  {
    key: 'dataset-management',
    label: '資料集管理',
    icon: '🗂️',
    path: '/dataset-management',
    description: '管理您的資料集'
  },
]; 