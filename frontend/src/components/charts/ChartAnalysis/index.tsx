import React, { useState, useMemo } from 'react';
import { Card, Row, Col, message } from 'antd';
import { BarChartOutlined, DatabaseOutlined } from '@ant-design/icons';
import { DataRow, Dataset, DatasetDetailResponse } from '../../../shared/types';
import { GenericChartDataSource } from '../../../shared/types/chart';
import { API_ENDPOINTS } from '../../../shared/constants';
import { apiRequest } from '../../../features/auth';
import { GenericChartAnalysis } from '../GenericChartAnalysis';
import { DatasetSelector } from '../../data/DatasetSelector';

export const ChartAnalysis: React.FC = () => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  // 處理資料集選擇
  const handleDatasetChange = async (datasetId: number, dataset: Dataset) => {
    setSelectedDatasetId(datasetId);
    setSelectedDataset(dataset);
    
    try {
      // 獲取資料集詳細資訊以獲得欄位資訊
      const response = await apiRequest(API_ENDPOINTS.DATASETS.DETAIL.replace(':id', datasetId.toString()), {
        method: 'GET'
      });

      if (response.ok) {
        const result: DatasetDetailResponse = await response.json();
        if (result.success && result.data) {
          setColumns(result.data.columns);
        }
      }
    } catch (error) {
      console.error('獲取資料集詳細資訊錯誤:', error);
      message.error('無法獲取資料集詳細資訊');
    }
  };

  // 創建資料來源適配器
  const datasetChartDataSource: GenericChartDataSource = useMemo(() => ({
    title: selectedDataset ? `${selectedDataset.name} 圖表分析` : 'CSV 資料集圖表分析',
    columns: columns,
    fetchData: async (): Promise<DataRow[]> => {
      if (!selectedDatasetId) {
        return [];
      }

      const response = await apiRequest(API_ENDPOINTS.DATASETS.DETAIL.replace(':id', selectedDatasetId.toString()), {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('無法載入資料集資料');
      }

      const result: DatasetDetailResponse = await response.json();
      
      if (result.success && result.data) {
        // 將 DataRecord 轉換為 DataRow 格式
        return result.data.records.map(record => JSON.parse(record.dataJson));
      }
      
      return [];
    }
  }), [selectedDatasetId, selectedDataset, columns]);

  return (
    <div className="chart-analysis-container">
      {/* 資料集選擇區域 */}
      <Card className="dataset-selection-card">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChartOutlined />
              CSV 資料集圖表分析
            </h3>
            {selectedDataset && (
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                資料集: {selectedDataset.name}
                {selectedDataset.description && ` (${selectedDataset.description})`}
              </div>
            )}
          </Col>
          <Col xs={24} sm={12} md={16}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <DatasetSelector
                value={selectedDatasetId || undefined}
                onChange={handleDatasetChange}
                placeholder="選擇要分析的資料集"
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* 圖表分析組件 */}
      {selectedDatasetId && selectedDataset && columns.length > 0 ? (
        <GenericChartAnalysis 
          dataSource={datasetChartDataSource}
          showDataSourceInfo={false}
          className="csv-chart-analysis"
        />
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <BarChartOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <h3 style={{ color: '#999' }}>請選擇要分析的資料集</h3>
            <p style={{ margin: 0 }}>請從上方下拉選單選擇一個資料集來開始圖表分析</p>
          </div>
        </Card>
      )}
    </div>
  );
}; 