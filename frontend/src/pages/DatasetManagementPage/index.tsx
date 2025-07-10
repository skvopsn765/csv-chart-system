import React, { useState, useEffect } from 'react';
import { Typography, Card, List, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, DatabaseOutlined, PlusOutlined } from '@ant-design/icons';
import { Dataset, DatasetsListResponse } from '../../shared/types';
import { API_ENDPOINTS } from '../../shared/constants';
import { apiRequest } from '../../features/auth';

const { Title, Paragraph } = Typography;

export const DatasetManagementPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [form] = Form.useForm();

  // 取得資料集列表
  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_ENDPOINTS.DATASETS.LIST, {
        method: 'GET'
      });

      const result: DatasetsListResponse = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || '取得資料集列表失敗');
      }

      setDatasets(result.data || []);
    } catch (error) {
      console.error('取得資料集列表錯誤:', error);
      message.error(error instanceof Error ? error.message : '取得資料集列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 刪除資料集
  const handleDelete = async (id: number) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.DATASETS.DELETE.replace(':id', id.toString()), {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '刪除資料集失敗');
      }

      message.success('資料集已刪除');
      fetchDatasets();
    } catch (error) {
      console.error('刪除資料集錯誤:', error);
      message.error(error instanceof Error ? error.message : '刪除資料集失敗');
    }
  };

  // 編輯資料集
  const handleEdit = (dataset: Dataset) => {
    setEditingDataset(dataset);
    form.setFieldsValue({
      name: dataset.name,
      description: dataset.description || ''
    });
    setEditModalVisible(true);
  };

  // 更新資料集
  const handleUpdate = async (values: { name: string; description?: string }) => {
    if (!editingDataset) return;

    try {
      const response = await apiRequest(API_ENDPOINTS.DATASETS.UPDATE.replace(':id', editingDataset.id.toString()), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '更新資料集失敗');
      }

      message.success('資料集已更新');
      setEditModalVisible(false);
      setEditingDataset(null);
      form.resetFields();
      fetchDatasets();
    } catch (error) {
      console.error('更新資料集錯誤:', error);
      message.error(error instanceof Error ? error.message : '更新資料集失敗');
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>資料集管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            // TODO: 導航到上傳頁面
            message.info('請前往「資料上傳」頁面建立新資料集');
          }}
        >
          新增資料集
        </Button>
      </div>

      <Card>
        <List
          loading={loading}
          dataSource={datasets}
          renderItem={(dataset) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(dataset)}
                >
                  編輯
                </Button>,
                <Popconfirm
                  key="delete"
                  title="確定要刪除此資料集嗎？"
                  description="刪除後無法復原，相關的資料記錄也會被刪除。"
                  onConfirm={() => handleDelete(dataset.id)}
                  okText="確定"
                  cancelText="取消"
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                  >
                    刪除
                  </Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={<DatabaseOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                title={dataset.name}
                description={
                  <div>
                    <Paragraph style={{ margin: 0, color: '#666' }}>
                      {dataset.description || '無描述'}
                    </Paragraph>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                      建立時間: {new Date(dataset.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: '尚未建立任何資料集，請先上傳 CSV 檔案'
          }}
        />
      </Card>

      {/* 編輯資料集對話框 */}
      <Modal
        title="編輯資料集"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingDataset(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            label="資料集名稱"
            name="name"
            rules={[{ required: true, message: '請輸入資料集名稱' }]}
          >
            <Input placeholder="請輸入資料集名稱" />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea
              placeholder="請輸入資料集描述（可選）"
              rows={3}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                更新
              </Button>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingDataset(null);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}; 