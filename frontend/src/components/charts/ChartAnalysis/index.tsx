import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, message } from 'antd';
import { BarChartOutlined, LineChartOutlined, DatabaseOutlined } from '@ant-design/icons';
import { DataRow, Dataset, DatasetDetailResponse, ChartType } from '../../../shared/types';
import { API_ENDPOINTS, CHART_TYPES } from '../../../shared/constants';
import { apiRequest } from '../../../features/auth';
import { ChartDisplay } from '../ChartDisplay';
import { FieldSelector } from '../FieldSelector';
import { DatasetSelector } from '../../data/DatasetSelector';

export const ChartAnalysis: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedXAxis, setSelectedXAxis] = useState<string>('');
  const [selectedYAxis, setSelectedYAxis] = useState<string[]>([]);
  const [chartType, setChartType] = useState<ChartType>(CHART_TYPES.LINE);
  const [loading, setLoading] = useState<boolean>(false);

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
        const rows = result.data.records.map(record => JSON.parse(record.dataJson));
        
        setData(rows);
        setColumns(result.data.columns);
        setSelectedDataset(result.data.dataset);
        
        // 重置圖表選擇
        setSelectedXAxis('');
        setSelectedYAxis([]);
        
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

  // 處理 X 軸欄位選擇
  const handleXAxisChange = (fieldName: string) => {
    setSelectedXAxis(fieldName);
  };

  // 處理 Y 軸欄位選擇
  const handleYAxisChange = (fieldNames: string[]) => {
    setSelectedYAxis(fieldNames);
  };

  // 切換圖表類型
  const toggleChartType = () => {
    setChartType(prev => 
      prev === CHART_TYPES.LINE ? CHART_TYPES.BAR : CHART_TYPES.LINE
    );
  };

  // 檢查是否可以顯示圖表
  const canShowChart = selectedXAxis && selectedYAxis.length > 0 && data.length > 0;

  return (
    <div className="chart-analysis-container">
      {/* 標題和資料集選擇 */}
      <Card className="dataset-selection-card">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChartOutlined />
              圖表分析
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
                disabled={loading}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {selectedDatasetId && data.length > 0 ? (
        <Row gutter={16}>
          {/* 欄位選擇區域 */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <Space>
                  <DatabaseOutlined />
                  欄位選擇
                </Space>
              }
              className="field-selector-card"
            >
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  資料概覽: 共 {data.length} 筆資料，{columns.length} 個欄位
                </div>
              </div>
              
              <FieldSelector 
                columns={columns}
                csvData={data}
                selectedXAxis={selectedXAxis}
                selectedYAxis={selectedYAxis}
                onXAxisChange={handleXAxisChange}
                onYAxisChange={handleYAxisChange}
              />
              
              <div style={{ marginTop: '20px' }}>
                <Button
                  type={chartType === CHART_TYPES.LINE ? 'primary' : 'default'}
                  icon={<LineChartOutlined />}
                  onClick={() => setChartType(CHART_TYPES.LINE)}
                  style={{ marginRight: '8px', marginBottom: '8px' }}
                >
                  摺線圖
                </Button>
                <Button
                  type={chartType === CHART_TYPES.BAR ? 'primary' : 'default'}
                  icon={<BarChartOutlined />}
                  onClick={() => setChartType(CHART_TYPES.BAR)}
                  style={{ marginBottom: '8px' }}
                >
                  長條圖
                </Button>
              </div>
            </Card>
          </Col>

          {/* 圖表顯示區域 */}
          <Col xs={24} lg={16}>
            <Card 
              title="圖表預覽"
              className="chart-display-card"
              loading={loading}
            >
              {canShowChart ? (
                <ChartDisplay
                  data={data}
                  xAxis={selectedXAxis}
                  yAxis={selectedYAxis}
                  chartType={chartType}
                />
              ) : (
                <div className="chart-placeholder">
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                    <BarChartOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                    <h3 style={{ color: '#999' }}>請選擇圖表欄位</h3>
                    <p style={{ margin: 0 }}>
                      {!selectedXAxis && '請選擇 X 軸欄位'}
                      {selectedXAxis && selectedYAxis.length === 0 && '請選擇 Y 軸欄位'}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      ) : selectedDatasetId ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <DatabaseOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <h3 style={{ color: '#999' }}>載入資料中...</h3>
            <p style={{ margin: 0 }}>正在載入資料集資料，請稍候</p>
          </div>
        </Card>
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