import React from 'react';
import { Card, Row, Col, Statistic, Space, Typography, Button } from 'antd';
import { 
  FileOutlined, 
  DatabaseOutlined, 
  BarChartOutlined, 
  RightOutlined,
  UploadOutlined,
  TableOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: '上傳資料',
      description: '匯入新的 CSV 檔案',
      icon: <UploadOutlined />,
      path: '/data-upload',
      color: '#1890ff'
    },
    {
      title: '資料表格',
      description: '查看和編輯資料',
      icon: <TableOutlined />,
      path: '/data-table',
      color: '#52c41a'
    },
    {
      title: '圖表分析',
      description: '建立視覺化圖表',
      icon: <BarChartOutlined />,
      path: '/chart-analysis',
      color: '#faad14'
    },
    {
      title: '資料集管理',
      description: '管理您的資料集',
      icon: <DatabaseOutlined />,
      path: '/dataset-management',
      color: '#722ed1'
    }
  ];

  return (
    <div style={{ padding: '0 24px' }}>
      {/* 歡迎區域 */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          歡迎使用 CSV 圖表分析系統
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          快速上傳、分析和視覺化您的資料，讓數據洞察變得簡單高效。
        </Paragraph>
      </div>

      {/* 統計資訊 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="資料集總數"
              value={0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="資料記錄"
              value={0}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="建立圖表"
              value={0}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日上傳"
              value={0}
              prefix={<UploadOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={3} style={{ marginBottom: '16px' }}>
          快速操作
        </Title>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card
                hoverable
                style={{ 
                  borderColor: action.color,
                  borderWidth: '2px',
                  height: '160px'
                }}
                onClick={() => navigate(action.path)}
              >
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  height: '100%',
                  justifyContent: 'center'
                }}>
                  <div style={{ 
                    fontSize: '32px', 
                    color: action.color,
                    marginBottom: '12px'
                  }}>
                    {action.icon}
                  </div>
                  <Title level={4} style={{ 
                    marginBottom: '8px',
                    color: action.color
                  }}>
                    {action.title}
                  </Title>
                  <Paragraph style={{ 
                    margin: 0, 
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    {action.description}
                  </Paragraph>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 功能介紹 */}
      <div>
        <Title level={3} style={{ marginBottom: '16px' }}>
          系統功能
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UploadOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>智慧資料匯入</Title>
                    <Paragraph style={{ margin: 0, color: '#666' }}>
                      支援 CSV 檔案自動解析和資料驗證
                    </Paragraph>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TableOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: '12px' }} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>資料表格管理</Title>
                    <Paragraph style={{ margin: 0, color: '#666' }}>
                      直接在表格中編輯和刪除資料記錄
                    </Paragraph>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <BarChartOutlined style={{ fontSize: '24px', color: '#faad14', marginRight: '12px' }} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>圖表視覺化</Title>
                    <Paragraph style={{ margin: 0, color: '#666' }}>
                      多種圖表類型，輕鬆建立美觀的視覺化
                    </Paragraph>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <DatabaseOutlined style={{ fontSize: '24px', color: '#722ed1', marginRight: '12px' }} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>資料集管理</Title>
                    <Paragraph style={{ margin: 0, color: '#666' }}>
                      統一管理和組織您的所有資料集
                    </Paragraph>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}; 