import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  theme,
  Button,
  Divider
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  TableOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../features/auth';
import './index.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onMenuSelect?: (key: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  currentPage = 'dashboard',
  onMenuSelect 
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 側邊欄選單項目
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '儀表板',
    },
    {
      key: 'csv-upload',
      icon: <FileTextOutlined />,
      label: 'CSV 上傳',
    },
    {
      key: 'data-table',
      icon: <TableOutlined />,
      label: '資料表格',
    },
    {
      key: 'charts',
      icon: <BarChartOutlined />,
      label: '圖表分析',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系統設定',
    },
  ];

  // 用戶下拉選單
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '設定',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      danger: true,
    },
  ];

  // 處理用戶選單點擊
  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      // 處理個人資料
      console.log('查看個人資料');
    } else if (key === 'settings') {
      // 處理設定
      console.log('系統設定');
    }
  };

  // 處理側邊欄選單點擊
  const handleMenuClick = ({ key }: { key: string }) => {
    if (onMenuSelect) {
      onMenuSelect(key);
    }
  };

  return (
    <Layout className="admin-layout">
      {/* 左側邊欄 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="admin-sider"
        theme="light"
        width={240}
      >
        <div className="logo">
          <div className="logo-icon">
            <BarChartOutlined />
          </div>
          {!collapsed && (
            <Title level={4} className="logo-text">
              CSV 管理系統
            </Title>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={handleMenuClick}
          className="admin-menu"
        />
      </Sider>

      {/* 主要內容區域 */}
      <Layout className="admin-main">
        {/* 頂部導航欄 */}
        <Header className="admin-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-btn"
            />
          </div>
          
          <div className="header-right">
            <Space>
              <Dropdown 
                menu={{ 
                  items: userMenuItems,
                  onClick: handleUserMenuClick 
                }}
                placement="bottomRight"
              >
                <Space className="user-info">
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />}
                    className="user-avatar"
                  />
                  <span className="username">
                    {user?.username || '未知用戶'}
                  </span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* 內容區域 */}
        <Content className="admin-content">
          <div
            className="content-wrapper"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}; 