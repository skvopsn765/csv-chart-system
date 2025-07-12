import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, message, Select } from 'antd';
import { BarChartOutlined, LineChartOutlined, DatabaseOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { DataRow, ChartType, SortOrder } from '../../../shared/types';
import { GenericChartAnalysisProps } from '../../../shared/types/chart';
import { CHART_TYPES, SORT_ORDERS } from '../../../shared/constants';
import { ChartDisplay } from '../ChartDisplay';
import { FieldSelector } from '../FieldSelector';

export const GenericChartAnalysis: React.FC<GenericChartAnalysisProps> = ({
  dataSource,
  showDataSourceInfo = true,
  className = ''
}) => {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedXAxis, setSelectedXAxis] = useState<string>('');
  const [selectedYAxis, setSelectedYAxis] = useState<string[]>([]);
  const [chartType, setChartType] = useState<ChartType>(CHART_TYPES.LINE);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SORT_ORDERS.NONE);

  // 載入資料
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await dataSource.fetchData();
      setData(result);

      // 重置圖表選擇
      setSelectedXAxis('');
      setSelectedYAxis([]);
      setSortOrder(SORT_ORDERS.NONE);

      if (result.length > 0) {
        message.success(`已載入 ${result.length} 筆資料`);
      } else {
        message.warning('沒有找到資料');
      }
    } catch (error) {
      console.error('載入資料錯誤:', error);
      message.error('載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  // 組件載入時自動載入資料
  useEffect(() => {
    loadData();
  }, [dataSource]);

  // 處理 X 軸欄位選擇
  const handleXAxisChange = (fieldName: string) => {
    setSelectedXAxis(fieldName);
    // 重置排序選項
    setSortOrder(SORT_ORDERS.NONE);
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
    <div className={`generic-chart-analysis-container ${className}`}>
      {/* 標題和資料來源資訊 */}
      {showDataSourceInfo && (
        <Card className="data-source-info-card">
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={8}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChartOutlined />
                圖表分析 - {dataSource.title}
              </h3>
              {data.length > 0 && (
                <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                  資料集: {data.length} 筆資料，{dataSource.columns.length} 個欄位
                </div>
              )}
            </Col>
            <Col xs={24} sm={12} md={16}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={loadData} loading={loading}>
                  重新載入資料
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {data.length > 0 ? (
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
                  資料概覽: 共 {data.length} 筆資料，{dataSource.columns.length} 個欄位
                </div>
              </div>

              <FieldSelector
                columns={dataSource.columns}
                csvData={data}
                selectedXAxis={selectedXAxis}
                selectedYAxis={selectedYAxis}
                onXAxisChange={handleXAxisChange}
                onYAxisChange={handleYAxisChange}
              />

              <div style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>圖表類型</h4>
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
                
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>X 軸排序</h4>
                  <Select
                    value={sortOrder}
                    onChange={setSortOrder}
                    style={{ width: '100%' }}
                    disabled={!selectedXAxis}
                    placeholder={selectedXAxis ? '選擇排序方式' : '請先選擇 X 軸欄位'}
                  >
                    <Select.Option value={SORT_ORDERS.NONE}>
                      <Space>
                        <DatabaseOutlined />
                        不排序
                      </Space>
                    </Select.Option>
                    <Select.Option value={SORT_ORDERS.ASC}>
                      <Space>
                        <SortAscendingOutlined />
                        升序（由小到大）
                      </Space>
                    </Select.Option>
                    <Select.Option value={SORT_ORDERS.DESC}>
                      <Space>
                        <SortDescendingOutlined />
                        降序（由大到小）
                      </Space>
                    </Select.Option>
                  </Select>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {selectedXAxis ? 
                      `對 ${selectedXAxis} 欄位進行排序` : 
                      '選擇 X 軸欄位後可設定排序方式'
                    }
                  </div>
                </div>
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
                  sortOrder={sortOrder}
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
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <DatabaseOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <h3 style={{ color: '#999' }}>
              {loading ? '載入資料中...' : '沒有可用的資料'}
            </h3>
            <p style={{ margin: 0 }}>
              {loading ? '正在載入資料，請稍候' : '請先上傳資料再進行圖表分析'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
