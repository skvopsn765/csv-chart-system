import React from 'react';
import { Typography } from 'antd';
import { ChartAnalysis } from '../../components/charts/ChartAnalysis';

const { Title } = Typography;

export const ChartAnalysisPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>圖表分析</Title>
      <ChartAnalysis />
    </div>
  );
}; 