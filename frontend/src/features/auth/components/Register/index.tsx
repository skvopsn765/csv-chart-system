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
  UserAddOutlined,
  BarChartOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterProps } from '../../types/auth';
import './index.css';

const { Title, Text } = Typography;

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();

  const handleSubmit = async (values: { username: string; password: string; confirmPassword: string }) => {
    setError('');
    setIsLoading(true);

    try {
      await register(values.username.trim(), values.password);
      // 註冊成功後，AuthContext 會自動更新狀態
    } catch (err) {
      setError(err instanceof Error ? err.message : '註冊失敗');
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
                    創建您的帳戶以開始使用
                  </Text>
                </div>
              </Space>
            </div>

            <Form
              form={form}
              name="register"
              onFinish={handleSubmit}
              layout="vertical"
              className="auth-form"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '請輸入用戶名' },
                  { min: 3, message: '用戶名至少需要3個字符' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '用戶名只能包含字母、數字和下底線' }
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
                  placeholder="請輸入密碼（至少 3 個字符）"
                  disabled={isLoading}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '請確認密碼' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('兩次輸入的密碼不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="請再次輸入密碼"
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
                  icon={<UserAddOutlined />}
                  className="auth-button"
                >
                  {isLoading ? '註冊中...' : '註冊'}
                </Button>
              </Form.Item>
            </Form>

            <Divider>
              <Text type="secondary">已有帳戶？</Text>
            </Divider>

            <div className="auth-footer">
              <Button
                type="link"
                onClick={onSwitchToLogin}
                disabled={isLoading}
                block
                className="register-link"
              >
                立即登入
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 