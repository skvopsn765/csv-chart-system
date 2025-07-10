import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { router } from './router';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhTW}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App; 