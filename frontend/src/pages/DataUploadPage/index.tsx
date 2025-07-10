import React, { useState } from 'react';
import { Typography, Alert } from 'antd';
import { CSVUploader } from '../../components/data/CSVUploader';
import { DataRow } from '../../shared/types';

const { Title } = Typography;

export const DataUploadPage: React.FC = () => {
  const [uploadedData, setUploadedData] = useState<{
    rows: DataRow[];
    columns: string[];
  } | null>(null);

  const handleUpload = (rows: DataRow[], columns: string[]) => {
    setUploadedData({ rows, columns });
  };

  return (
    <div>
      <Title level={2}>資料上傳</Title>
      
      {uploadedData && (
        <Alert
          message="上傳成功"
          description={`已成功上傳 ${uploadedData.rows.length} 筆資料，包含 ${uploadedData.columns.length} 個欄位。`}
          type="success"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}
      
      <CSVUploader onUpload={handleUpload} />
    </div>
  );
}; 