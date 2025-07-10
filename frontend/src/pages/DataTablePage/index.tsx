import React from 'react';
import { Typography } from 'antd';
import { DataTable } from '../../components/data/DataTable';

const { Title } = Typography;

export const DataTablePage: React.FC = () => {
  return (
    <div>
      <Title level={2}>資料表格</Title>
      <DataTable />
    </div>
  );
}; 