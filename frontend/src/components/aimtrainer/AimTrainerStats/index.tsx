import React, { useState, useEffect } from 'react';
import { Card, Typography, Statistic, Row, Col, Table, Button, Space, Select, message } from 'antd';
import { AimOutlined, FileTextOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { AimTrainerStatistics, AimTrainerRecord } from '../../../shared/types/aimtrainer';
import { apiRequest } from '../../../features/auth/utils/auth';
import './index.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface AimTrainerStatsProps {
  refreshTrigger: number;
}

const AimTrainerStats: React.FC<AimTrainerStatsProps> = ({ refreshTrigger }) => {
  const [statistics, setStatistics] = useState<AimTrainerStatistics | null>(null);
  const [records, setRecords] = useState<AimTrainerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<string>('');
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);

  // 獲取統計資料
  const fetchStatistics = async () => {
    try {
      const response = await apiRequest('/api/aimtrainer/statistics');
      if (response.ok) {
        const result = await response.json();
        setStatistics(result.data);
      } else {
        throw new Error('獲取統計資料失敗');
      }
    } catch (error) {
      message.error('獲取統計資料失敗');
      console.error('統計資料錯誤:', error);
    }
  };

  // 獲取記錄列表
  const fetchRecords = async (weapon = '', challengeName = '', page = currentPage, limit = pageSize) => {
    setRecordsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (weapon) queryParams.append('weapon', weapon);
      if (challengeName) queryParams.append('challengeName', challengeName);

      const response = await apiRequest(`/api/aimtrainer/records?${queryParams}`);
      if (response.ok) {
        const result = await response.json();
        setRecords(result.data);
        setTotalRecords(result.pagination.total);
      } else {
        throw new Error('獲取記錄失敗');
      }
    } catch (error) {
      message.error('獲取記錄失敗');
      console.error('記錄獲取錯誤:', error);
    } finally {
      setRecordsLoading(false);
    }
  };

  // 刪除記錄
  const handleDeleteRecord = async (recordId: number) => {
    try {
      const response = await apiRequest(`/api/aimtrainer/records/${recordId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        message.success('記錄已刪除');
        fetchRecords(selectedWeapon, selectedChallenge, currentPage, pageSize);
        fetchStatistics();
      } else {
        throw new Error('刪除失敗');
      }
    } catch (error) {
      message.error('刪除記錄失敗');
      console.error('刪除錯誤:', error);
    }
  };

  // 重新整理資料
  const handleRefresh = () => {
    setLoading(true);
    Promise.all([
      fetchStatistics(),
      fetchRecords(selectedWeapon, selectedChallenge, currentPage, pageSize)
    ]).finally(() => {
      setLoading(false);
    });
  };

  // 篩選變更
  const handleFilterChange = (weapon: string, challenge: string) => {
    setSelectedWeapon(weapon);
    setSelectedChallenge(challenge);
    setCurrentPage(1); // 重置到第一頁
    fetchRecords(weapon, challenge, 1, pageSize);
  };

  // 分頁變更處理
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchRecords(selectedWeapon, selectedChallenge, page, size);
  };

  // 每頁顯示數量變更處理
  const handleShowSizeChange = (current: number, size: number) => {
    setCurrentPage(1); // 重置到第一頁
    setPageSize(size);
    fetchRecords(selectedWeapon, selectedChallenge, 1, size);
  };

  // 表格欄位定義
  const recordColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '檔案',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
    },
    {
      title: '挑戰',
      dataIndex: 'challengeName',
      key: 'challengeName',
    },
    {
      title: '武器',
      dataIndex: 'weapon',
      key: 'weapon',
    },
    {
      title: '命中',
      dataIndex: 'shotsHit',
      key: 'shotsHit',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '總射擊',
      dataIndex: 'totalShots',
      key: 'totalShots',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '準確度',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: '傷害',
      dataIndex: 'damage',
      key: 'damage',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '爆頭',
      dataIndex: 'criticalShots',
      key: 'criticalShots',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '上傳時間',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: AimTrainerRecord) => (
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRecord(record.id)}
          danger
        />
      ),
    },
  ];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchStatistics(),
      fetchRecords('', '', 1, 10) // 初始化時使用第1頁，每頁10筆
    ]).finally(() => {
      setLoading(false);
    });
  }, [refreshTrigger]);

  if (loading && !statistics) {
    return (
      <Card>
        <div className="loading-state">
          <Text>載入中...</Text>
        </div>
      </Card>
    );
  }

  if (!statistics || statistics.totalRecords === 0) {
    return (
      <Card>
        <div className="empty-state">
          <AimOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <Title level={4} type="secondary">沒有訓練資料</Title>
          <Text type="secondary">請先上傳 AimTrainer 文件</Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="aimtrainer-stats">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 統計資料 */}
        <Card>
          <div className="stats-header">
            <Title level={4}>
              <FileTextOutlined /> 訓練統計
            </Title>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              重新整理
            </Button>
          </div>

          <div className="statistics-section">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="總回合數"
                  value={statistics.totalRecords}
                  prefix={<AimOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="總射擊次數"
                  value={statistics.totalShots}
                  formatter={(value) => value?.toLocaleString()}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="總命中次數"
                  value={statistics.totalHits}
                  formatter={(value) => value?.toLocaleString()}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均準確度"
                  value={statistics.avgAccuracy}
                  suffix="%"
                  precision={2}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={6}>
                <Statistic
                  title="總傷害"
                  value={statistics.totalDamage}
                  formatter={(value) => value?.toLocaleString()}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="總爆頭數"
                  value={statistics.totalCrits}
                  formatter={(value) => value?.toLocaleString()}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="最常用武器"
                  value={statistics.weapons[0]?.weapon || 'N/A'}
                  formatter={(value) => <Text strong>{value}</Text>}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="使用次數"
                  value={statistics.weapons[0]?.count || 0}
                  formatter={(value) => value?.toLocaleString()}
                />
              </Col>
            </Row>
          </div>
        </Card>

        {/* 記錄列表 */}
        <Card>
          <div className="records-header">
            <Title level={4}>訓練記錄</Title>
            <Space>
              <Select
                placeholder="選擇武器"
                style={{ width: 120 }}
                allowClear
                value={selectedWeapon}
                onChange={(value) => handleFilterChange(value || '', selectedChallenge)}
              >
                {statistics.weapons
                  .filter(weapon => weapon.weapon && weapon.weapon.trim() !== '')
                  .map(weapon => (
                    <Option key={weapon.weapon} value={weapon.weapon}>
                      {weapon.weapon}
                    </Option>
                  ))}
              </Select>
              <Select
                placeholder="選擇挑戰"
                style={{ width: 150 }}
                allowClear
                value={selectedChallenge}
                onChange={(value) => handleFilterChange(selectedWeapon, value || '')}
              >
                {statistics.challenges
                  .filter(challenge => challenge.challengeName && challenge.challengeName.trim() !== '')
                  .map(challenge => (
                    <Option key={challenge.challengeName} value={challenge.challengeName}>
                      {challenge.challengeName}
                    </Option>
                  ))}
              </Select>
            </Space>
          </div>

          <Table
            columns={recordColumns}
            dataSource={records}
            loading={recordsLoading}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalRecords,
              showSizeChanger: true,
              pageSizeOptions: ['10', '50', '100', '200', '500'],
              showTotal: (total, range) => `${range[0]}-${range[1]} 共 ${total} 筆`,
              onChange: handlePageChange,
              onShowSizeChange: handleShowSizeChange,
            }}
            scroll={{ x: 1000 }}
            size="small"
          />
        </Card>
      </Space>
    </div>
  );
};

export default AimTrainerStats;
