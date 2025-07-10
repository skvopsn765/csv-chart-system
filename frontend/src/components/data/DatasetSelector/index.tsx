import React, { useState, useEffect } from 'react';
import { Modal, Button, Select, Input, Alert, Space, List, Card, Typography } from 'antd';
import { PlusOutlined, DatabaseOutlined, FileTextOutlined } from '@ant-design/icons';
import { Dataset, DatasetsListResponse } from '../../../shared/types';
import { API_ENDPOINTS } from '../../../shared/constants';
import { apiRequest } from '../../../features/auth';

const { Option } = Select;
const { Text } = Typography;

interface DatasetSelectorProps {
  visible: boolean;
  columns: string[];
  onSelect: (datasetId: number) => void;
  onCancel: () => void;
  onCreateNew: (name: string, description?: string) => void;
  loading?: boolean;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  visible,
  columns,
  onSelect,
  onCancel,
  onCreateNew,
  loading = false
}) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newDatasetName, setNewDatasetName] = useState<string>('');
  const [newDatasetDescription, setNewDatasetDescription] = useState<string>('');
  const [loadingDatasets, setLoadingDatasets] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 取得用戶的資料集列表
  const fetchDatasets = async () => {
    try {
      setLoadingDatasets(true);
      setError('');
      
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
      setError(error instanceof Error ? error.message : '取得資料集列表失敗');
    } finally {
      setLoadingDatasets(false);
    }
  };

  // 檢查資料集是否與當前欄位相容
  const isDatasetCompatible = (dataset: Dataset): boolean => {
    try {
      const datasetColumns = JSON.parse(dataset.columnsInfo);
      return JSON.stringify(columns.sort()) === JSON.stringify(datasetColumns.sort());
    } catch {
      return false;
    }
  };

  // 當對話框打開時取得資料集
  useEffect(() => {
    if (visible) {
      fetchDatasets();
      setSelectedDatasetId(null);
      setShowCreateForm(false);
      setNewDatasetName('');
      setNewDatasetDescription('');
    }
  }, [visible]);

  // 處理選擇資料集
  const handleSelectDataset = () => {
    if (selectedDatasetId) {
      onSelect(selectedDatasetId);
    }
  };

  // 處理創建新資料集
  const handleCreateDataset = () => {
    if (newDatasetName.trim()) {
      onCreateNew(newDatasetName.trim(), newDatasetDescription.trim() || undefined);
      setShowCreateForm(false);
      setNewDatasetName('');
      setNewDatasetDescription('');
    }
  };

  // 取得相容的資料集
  const compatibleDatasets = datasets.filter(isDatasetCompatible);
  const incompatibleDatasets = datasets.filter(ds => !isDatasetCompatible(ds));

  return (
    <Modal
      title={
        <Space>
          <DatabaseOutlined />
          選擇目標資料集
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div style={{ marginBottom: '16px' }}>
        <Alert
          message="CSV 欄位資訊"
          description={
            <div>
              <Text strong>檔案包含以下欄位：</Text>
              <div style={{ marginTop: '8px' }}>
                {columns.map((col, index) => (
                  <span key={index} style={{ 
                    display: 'inline-block', 
                    margin: '2px 4px', 
                    padding: '2px 8px', 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {col}
                  </span>
                ))}
              </div>
            </div>
          }
          type="info"
          showIcon
        />
      </div>

      {error && (
        <Alert
          message="錯誤"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      {!showCreateForm ? (
        <div>
          {/* 相容的資料集 */}
          {compatibleDatasets.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4>相容的資料集（欄位結構相同）：</h4>
              <List
                dataSource={compatibleDatasets}
                renderItem={dataset => (
                  <List.Item>
                    <Card 
                      size="small"
                      style={{ 
                        width: '100%', 
                        cursor: 'pointer',
                        border: selectedDatasetId === dataset.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                      }}
                      onClick={() => setSelectedDatasetId(dataset.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>{dataset.name}</Text>
                          {dataset.description && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {dataset.description}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {new Date(dataset.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
              
              <Space style={{ marginTop: '8px' }}>
                <Button
                  type="primary"
                  onClick={handleSelectDataset}
                  disabled={!selectedDatasetId}
                  loading={loading}
                >
                  選擇此資料集
                </Button>
              </Space>
            </div>
          )}

          {/* 不相容的資料集 */}
          {incompatibleDatasets.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4>不相容的資料集（欄位結構不同）：</h4>
              <List
                dataSource={incompatibleDatasets}
                renderItem={dataset => (
                  <List.Item>
                    <Card 
                      size="small"
                      style={{ 
                        width: '100%', 
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #d9d9d9'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text>{dataset.name}</Text>
                          {dataset.description && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {dataset.description}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          不相容
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* 創建新資料集 */}
          <div>
            <h4>或者創建新的資料集：</h4>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateForm(true)}
              style={{ width: '100%' }}
            >
              創建新資料集
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <h4>創建新資料集：</h4>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="資料集名稱（必填）"
              value={newDatasetName}
              onChange={(e) => setNewDatasetName(e.target.value)}
              maxLength={100}
            />
            <Input.TextArea
              placeholder="資料集描述（可選）"
              value={newDatasetDescription}
              onChange={(e) => setNewDatasetDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <Space>
              <Button
                type="primary"
                onClick={handleCreateDataset}
                disabled={!newDatasetName.trim()}
                loading={loading}
              >
                創建並使用
              </Button>
              <Button onClick={() => setShowCreateForm(false)}>
                取消
              </Button>
            </Space>
          </Space>
        </div>
      )}
    </Modal>
  );
}; 