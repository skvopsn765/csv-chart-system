import React from 'react';
import { Modal, Button, Table, Alert, Space } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { DataRow, DuplicateCheckResult } from '../../../shared/types';

interface DuplicateConfirmationProps {
  visible: boolean;
  duplicateResult: DuplicateCheckResult | null;
  columns: string[];
  fileName: string;
  onConfirm: () => void;
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

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          發現重複資料
        </Space>
      }
      open={visible}
      onOk={onConfirm}
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
        <h4>重複的資料內容：</h4>
        <Table
          columns={tableColumns}
          dataSource={dataSource}
          pagination={{
            pageSize: 5,
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
            <p>如果您選擇「繼續上傳」，這些重複資料仍會被儲存到資料庫中。</p>
            <p>建議您檢查資料內容，確認是否需要繼續上傳。</p>
          </div>
        }
        type="info"
        showIcon
      />
    </Modal>
  );
}; 