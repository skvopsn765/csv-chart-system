import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, message, Select, Checkbox } from 'antd';
import { BarChartOutlined, LineChartOutlined, DatabaseOutlined, SortAscendingOutlined, SortDescendingOutlined, StockOutlined, NumberOutlined } from '@ant-design/icons';
import { DataRow, ChartType, SortOrder, DataLimitOption } from '../../../shared/types';
import { GenericChartAnalysisProps } from '../../../shared/types/chart';
import { CHART_TYPES, SORT_ORDERS, DATA_LIMIT_OPTIONS } from '../../../shared/constants';
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
  const [showTrendLine, setShowTrendLine] = useState<boolean>(false);
  const [dataLimit, setDataLimit] = useState<DataLimitOption>(DATA_LIMIT_OPTIONS.SMALL);

  // 載入資料
  const loadData = async (newLimit?: DataLimitOption) => {
    setLoading(true);
    try {
      const limitToUse = newLimit || dataLimit;
      const result = await dataSource.fetchData(limitToUse);
      setData(result);

      // 重置圖表選擇
      setSelectedXAxis('');
      setSelectedYAxis([]);
      setSortOrder(SORT_ORDERS.NONE);
      setShowTrendLine(false);

      if (result.length > 0) {
        const limitText = limitToUse === 'all' ? '全部' : `${limitToUse} 筆`;
        message.success(`已載入 ${result.length} 筆資料（限制：${limitText}）`);
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

  // 處理資料量選擇變更
  const handleDataLimitChange = (newLimit: DataLimitOption) => {
    setDataLimit(newLimit);
    loadData(newLimit);
  };

  // 重新載入資料按鈕處理器
  const handleReloadData = () => {
    loadData();
  };

  // 組件載入時自動載入資料
  useEffect(() => {
    loadData();
  }, [dataSource]);

  // 重置資料量設定當資料來源變更時
  useEffect(() => {
    setDataLimit(DATA_LIMIT_OPTIONS.SMALL);
  }, [dataSource]);

  // 處理 X 軸欄位選擇
  const handleXAxisChange = (fieldName: string) => {
    setSelectedXAxis(fieldName);
    // 重置排序選項和趨勢線選項
    setSortOrder(SORT_ORDERS.NONE);
    setShowTrendLine(false);
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
                <Button onClick={handleReloadData} loading={loading}>
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
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>資料量設定</h4>
                <Select
                  value={dataLimit}
                  onChange={handleDataLimitChange}
                  style={{ width: '100%', marginBottom: '8px' }}
                  loading={loading}
                >
                  <Select.Option value={DATA_LIMIT_OPTIONS.SMALL}>
                    <Space>
                      <NumberOutlined />
                      100 筆資料
                    </Space>
                  </Select.Option>
                  <Select.Option value={DATA_LIMIT_OPTIONS.MEDIUM}>
                    <Space>
                      <NumberOutlined />
                      500 筆資料
                    </Space>
                  </Select.Option>
                  <Select.Option value={DATA_LIMIT_OPTIONS.ALL}>
                    <Space>
                      <DatabaseOutlined />
                      全部資料
                    </Space>
                  </Select.Option>
                </Select>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
                  已載入: {data.length} 筆資料 / 限制: {dataLimit === 'all' ? '全部' : `${dataLimit} 筆`}
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
                
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>趨勢線</h4>
                  <Checkbox 
                    checked={showTrendLine}
                    onChange={(e) => setShowTrendLine(e.target.checked)}
                    disabled={!selectedXAxis || selectedYAxis.length === 0}
                  >
                    <Space>
                      <StockOutlined />
                      顯示趨勢線
                    </Space>
                  </Checkbox>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {selectedXAxis && selectedYAxis.length > 0 ? 
                      '顯示線性回歸趨勢線（僅支援數值型 X 軸）' : 
                      '選擇 X 軸和 Y 軸欄位後可顯示趨勢線'
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
                  showTrendLine={showTrendLine}
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
