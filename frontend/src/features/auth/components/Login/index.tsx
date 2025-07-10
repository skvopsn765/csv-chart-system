import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Alert, 
  Space,
  Divider 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined,
  BarChartOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { LoginProps } from '../../types/auth';
import './index.css';

const { Title, Text } = Typography;

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setError('');
    setIsLoading(true);

    try {
      await login(values.username, values.password);
      // 登入成功後，AuthContext 會自動更新狀態
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-overlay">
          <Card className="auth-card" bordered={false}>
            <div className="auth-header">
              <Space direction="vertical" align="center" size="large">
                <div className="logo-container">
                  <BarChartOutlined className="logo-icon" />
                </div>
                <div className="title-container">
                  <Title level={2} className="auth-title">
                    CSV 管理系統
                  </Title>
                  <Text type="secondary" className="auth-subtitle">
                    登入您的帳戶以開始使用
                  </Text>
                </div>
              </Space>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={handleSubmit}
              layout="vertical"
              className="auth-form"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '請輸入用戶名' },
                  { min: 3, message: '用戶名至少需要3個字符' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="請輸入用戶名"
                  disabled={isLoading}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '請輸入密碼' },
                  { min: 3, message: '密碼至少需要3個字符' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="請輸入密碼"
                  disabled={isLoading}
                />
              </Form.Item>

              {error && (
                <Form.Item>
                  <Alert
                    message={error}
                    type="error"
                    showIcon
                    className="error-alert"
                  />
                </Form.Item>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  block
                  icon={<LoginOutlined />}
                  className="auth-button"
                >
                  {isLoading ? '登入中...' : '登入'}
                </Button>
              </Form.Item>
            </Form>

            <Divider>
              <Text type="secondary">還沒有帳戶？</Text>
            </Divider>

            <div className="auth-footer">
              <Button
                type="link"
                onClick={onSwitchToRegister}
                disabled={isLoading}
                block
                className="register-link"
              >
                立即註冊
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 