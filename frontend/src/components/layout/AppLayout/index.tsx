import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  LogoutOutlined, 
  UserOutlined,
  HomeOutlined,
  UploadOutlined,
  TableOutlined,
  BarChartOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../features/auth/contexts/AuthContext';
import { navigationMenuItems } from '../../../router';
import './index.css';

const { Header, Sider, Content } = AntLayout;

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 圖示映射
  const iconMap: { [key: string]: React.ReactNode } = {
    'home': <HomeOutlined />,
    'data-upload': <UploadOutlined />,
    'data-table': <TableOutlined />,
    'chart-analysis': <BarChartOutlined />,
    'dataset-management': <DatabaseOutlined />,
  };

  // 選單項目
  const menuItems = navigationMenuItems.map(item => ({
    key: item.key,
    icon: iconMap[item.key] || item.icon,
    label: item.label,
    onClick: () => navigate(item.path),
  }));

  // 取得當前選中的選單項目
  const currentPath = location.pathname;
  const selectedKeys = navigationMenuItems
    .filter(item => item.path === currentPath)
    .map(item => item.key);

  // 用戶下拉選單
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料',
      onClick: () => {
        // TODO: 導航到個人資料頁面
      }
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: () => logout(),
    },
  ];

  return (
    <AntLayout className="app-layout">
      {/* 側邊欄 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="app-sider"
        width={280}
        collapsedWidth={80}
      >
        {/* Logo 區域 */}
        <div className="app-logo">
          <div className="logo-content">
            {!collapsed && (
              <>
                <span className="logo-icon">📊</span>
                <span className="logo-text">CSV 圖表系統</span>
              </>
            )}
            {collapsed && <span className="logo-icon">📊</span>}
          </div>
        </div>

        {/* 導航選單 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          className="app-menu"
        />
      </Sider>

      {/* 主要內容區域 */}
      <AntLayout>
        {/* 標題欄 */}
        <Header className="app-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-button"
            />
            <div className="breadcrumb">
              <span className="current-page">
                {navigationMenuItems.find(item => item.path === currentPath)?.label || '首頁'}
              </span>
            </div>
          </div>

          <div className="header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="user-info">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="username">{user?.username}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* 內容區域 */}
        <Content className="app-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
}; 