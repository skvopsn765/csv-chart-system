import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Alert, Space, Checkbox } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, SelectOutlined } from '@ant-design/icons';
import { DataRow, DuplicateCheckResult } from '../../../shared/types';

interface DuplicateConfirmationProps {
  visible: boolean;
  duplicateResult: DuplicateCheckResult | null;
  columns: string[];
  fileName: string;
  onConfirm: (selectedRows: DataRow[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DuplicateConfirmation: React.FC<DuplicateConfirmationProps> = ({
  visible,
  duplicateResult,
  columns,
  fileName,
  onConfirm,
  onCancel,
  loading = false
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 重置選擇狀態
  useEffect(() => {
    if (visible && duplicateResult) {
      // 預設選擇所有行
      const allKeys = duplicateResult.duplicateRows.map((_, index) => `duplicate-${index}`);
      setSelectedRowKeys(allKeys);
    }
  }, [visible, duplicateResult]);

  if (!duplicateResult) return null;

  // 準備表格欄位
  const tableColumns = columns.map(col => ({
    title: col,
    dataIndex: col,
    key: col,
    render: (text: any) => {
      if (text === null || text === undefined || text === '') {
        return <span style={{ color: '#ccc' }}>(空值)</span>;
      }
      return String(text);
    }
  }));

  // 為重複資料行添加唯一key
  const dataSource = duplicateResult.duplicateRows.map((row, index) => ({
    ...row,
    key: `duplicate-${index}`
  }));

  // 處理選擇變更
  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  // 處理確認上傳
  const handleConfirm = () => {
    const selectedRows = selectedRowKeys.map(key => {
      const index = parseInt(key.toString().replace('duplicate-', ''));
      return duplicateResult.duplicateRows[index];
    });
    onConfirm(selectedRows);
  };

  // 全選/取消全選
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = duplicateResult.duplicateRows.map((_, index) => `duplicate-${index}`);
      setSelectedRowKeys(allKeys);
    } else {
      setSelectedRowKeys([]);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectChange,
    onSelectAll: handleSelectAll,
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          發現重複資料
        </Space>
      }
      open={visible}
      onOk={handleConfirm}
      onCancel={onCancel}
      width={800}
      confirmLoading={loading}
      okText="繼續上傳"
      cancelText="取消"
      okButtonProps={{
        type: 'primary',
        danger: true,
        icon: <CheckCircleOutlined />
      }}
      cancelButtonProps={{
        icon: <CloseCircleOutlined />
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <Alert
          message="重複資料警告"
          description={
            <div>
              <p><strong>檔案名稱：</strong>{fileName}</p>
              <p><strong>發現重複資料：</strong>{duplicateResult.duplicateCount} 筆</p>
              <p><strong>資料庫現有資料：</strong>{duplicateResult.existingDataCount} 筆</p>
            </div>
          }
          type="warning"
          showIcon
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4>重複的資料內容：</h4>
          <Space>
            <Button 
              size="small" 
              icon={<SelectOutlined />}
              onClick={() => handleSelectAll(true)}
            >
              全選
            </Button>
            <Button 
              size="small" 
              onClick={() => handleSelectAll(false)}
            >
              取消全選
            </Button>
          </Space>
        </div>
        <Table
          columns={tableColumns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: false
          }}
          size="small"
          scroll={{ x: 'max-content' }}
          style={{ border: '1px solid #d9d9d9' }}
        />
      </div>

      <Alert
        message="確認操作"
        description={
          <div>
            <p>系統發現您要上傳的資料中有 <strong>{duplicateResult.duplicateCount}</strong> 筆與資料庫中的現有資料完全相同。</p>
            <p>您可以勾選想要上傳的資料，目前已選擇 <strong>{selectedRowKeys.length}</strong> 筆資料。</p>
            <p>如果您選擇「繼續上傳」，選中的重複資料仍會被儲存到資料庫中。</p>
            <p>建議您檢查資料內容，確認是否需要繼續上傳。</p>
          </div>
        }
        type="info"
        showIcon
      />
    </Modal>
  );
}; 