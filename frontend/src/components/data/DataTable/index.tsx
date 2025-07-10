import React, { useState, useEffect } from 'react';
import { Table, Button, Select, message, Modal, Form, Input, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, DatabaseOutlined } from '@ant-design/icons';
import { DataRow, Dataset, DatasetDetailResponse } from '../../../shared/types';
import { API_ENDPOINTS } from '../../../shared/constants';
import { apiRequest } from '../../../features/auth';
import { DatasetSelector } from '../DatasetSelector';
import './index.css';

interface DataTableProps {
  data?: DataRow[] | null;
  columns?: string[];
}

interface TableDataRow extends DataRow {
  id: number;
  key: string;
}

export const DataTable: React.FC<DataTableProps> = ({ data: initialData, columns: initialColumns }) => {
  const [data, setData] = useState<DataRow[]>(initialData || []);
  const [columns, setColumns] = useState<string[]>(initialColumns || []);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<TableDataRow | null>(null);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  // 載入指定資料集的資料
  const loadDatasetData = async (datasetId: number) => {
    setLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.DATASETS.DETAIL.replace(':id', datasetId.toString()), {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('無法載入資料集資料');
      }

      const result: DatasetDetailResponse = await response.json();
      
      if (result.success && result.data) {
        // 將 DataRecord 轉換為 DataRow 格式
        const rows = result.data.records.map(record => ({
          id: record.id,
          ...JSON.parse(record.dataJson)
        }));
        
        setData(rows);
        setColumns(result.data.columns);
        setSelectedDataset(result.data.dataset);
        message.success(`已載入資料集: ${result.data.dataset.name}`);
      }
    } catch (error) {
      console.error('載入資料集資料錯誤:', error);
      message.error('載入資料集資料失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理資料集選擇
  const handleDatasetChange = (datasetId: number, dataset: Dataset) => {
    setSelectedDatasetId(datasetId);
    loadDatasetData(datasetId);
  };

  // 處理編輯記錄
  const handleEditRecord = (record: TableDataRow) => {
    setEditingRecord(record);
    setEditModalVisible(true);
    
    // 設定表單初始值
    const formValues: any = {};
    columns.forEach(col => {
      formValues[col] = record[col];
    });
    form.setFieldsValue(formValues);
  };

  // 處理刪除記錄
  const handleDeleteRecord = async (recordId: number) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.RECORDS.DELETE.replace(':id', recordId.toString()), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('刪除記錄失敗');
      }

      message.success('記錄已成功刪除');
      
      // 重新載入資料
      if (selectedDatasetId) {
        loadDatasetData(selectedDatasetId);
      }
    } catch (error) {
      console.error('刪除記錄錯誤:', error);
      message.error('刪除記錄失敗');
    }
  };

  // 處理編輯表單提交
  const handleEditSubmit = async (values: any) => {
    if (!editingRecord) return;

    try {
      const response = await apiRequest(API_ENDPOINTS.RECORDS.UPDATE.replace(':id', editingRecord.id.toString()), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dataJson: values
        })
      });

      if (!response.ok) {
        throw new Error('更新記錄失敗');
      }

      message.success('記錄已成功更新');
      setEditModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
      
      // 重新載入資料
      if (selectedDatasetId) {
        loadDatasetData(selectedDatasetId);
      }
    } catch (error) {
      console.error('更新記錄錯誤:', error);
      message.error('更新記錄失敗');
    }
  };

  // 處理編輯對話框取消
  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // 構建表格欄位
  const tableColumns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1
    },
    ...columns.map(col => ({
      title: col,
      dataIndex: col,
      key: col,
      render: (text: any) => String(text || '')
    })),
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: any, record: TableDataRow) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditRecord(record)}
          >
            編輯
          </Button>
          <Popconfirm
            title="確定要刪除這筆記錄嗎？"
            onConfirm={() => handleDeleteRecord(record.id)}
            okText="確定"
            cancelText="取消"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              刪除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 準備表格資料
  const tableData: TableDataRow[] = data.map((row, index) => ({
    ...row,
    key: `${row.id || index}`,
    id: typeof row.id === 'number' ? row.id : index
  }));

  return (
    <div className="data-table-container">
      <div className="table-header">
        <div className="header-left">
          <h3>
            <DatabaseOutlined /> 資料表格
          </h3>
          {selectedDataset && (
            <div className="dataset-info">
              <span>資料集: {selectedDataset.name}</span>
              {selectedDataset.description && (
                <span className="dataset-description">（{selectedDataset.description}）</span>
              )}
            </div>
          )}
        </div>
        <div className="header-right">
          <DatasetSelector
            value={selectedDatasetId || undefined}
            onChange={handleDatasetChange}
            placeholder="選擇要顯示的資料集"
          />
        </div>
      </div>

      {selectedDatasetId ? (
        <div className="table-content">
          <div className="table-info">
            <span>共 {data.length} 筆資料</span>
            <span>共 {columns.length} 個欄位</span>
          </div>
          
          <Table
            columns={tableColumns}
            dataSource={tableData}
            loading={loading}
            pagination={{
              total: data.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 筆，共 ${total} 筆資料`
            }}
            scroll={{ x: 'max-content' }}
            size="middle"
          />
        </div>
      ) : (
        <div className="empty-state">
          <h3>請選擇要顯示的資料集</h3>
          <p>請從上方下拉選單選擇一個資料集來查看資料內容</p>
        </div>
      )}

      {/* 編輯對話框 */}
      <Modal
        title="編輯記錄"
        open={editModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          {columns.map(col => (
            <Form.Item
              key={col}
              label={col}
              name={col}
              rules={[
                {
                  required: true,
                  message: `請輸入${col}`
                }
              ]}
            >
              <Input />
            </Form.Item>
          ))}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                確定
              </Button>
              <Button onClick={handleEditCancel}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}; 