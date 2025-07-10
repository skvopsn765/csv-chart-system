import React, { useState } from 'react';
import CSVUploader from './components/CSVUploader';
import FieldSelector from './components/FieldSelector';
import ChartDisplay from './components/ChartDisplay';
import DataTable from './components/DataTable';
import { TabPanel, Tab } from './components/TabPanel';
import UserInfo from './components/UserInfo';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ChartType, CSVData } from './types';
import './App.css';

// 圖表類型常數
const CHART_TYPES: { [key: string]: ChartType } = {
  LINE: 'line',
  BAR: 'bar'
};

interface CSVDataStructure {
  [key: string]: string | number;
}

const AppContent: React.FC = () => {
  // 主要狀態管理
  const [csvData, setCsvData] = useState<CSVDataStructure[] | null>(null); // CSV 解析後的資料
  const [columns, setColumns] = useState<string[]>([]); // 欄位名稱陣列
  const [selectedXAxis, setSelectedXAxis] = useState<string>(''); // 選擇的 X 軸欄位
  const [selectedYAxis, setSelectedYAxis] = useState<string[]>([]); // 選擇的 Y 軸欄位陣列
  const [chartType, setChartType] = useState<ChartType>(CHART_TYPES.LINE); // 圖表類型

  // 處理 CSV 上傳成功
  const handleCSVUpload = (data: CSVDataStructure[], columnsData: string[]): void => {
    setCsvData(data);
    setColumns(columnsData);
    // 重置選擇的欄位
    setSelectedXAxis('');
    setSelectedYAxis([]);
  };

  // 處理 X 軸欄位選擇
  const handleXAxisChange = (fieldName: string): void => {
    setSelectedXAxis(fieldName);
  };

  // 處理 Y 軸欄位選擇
  const handleYAxisChange = (fieldNames: string[]): void => {
    setSelectedYAxis(fieldNames);
  };

  // 切換圖表類型
  const toggleChartType = (): void => {
    setChartType(prev => 
      prev === CHART_TYPES.LINE ? CHART_TYPES.BAR : CHART_TYPES.LINE
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CSV 資料繪圖系統</h1>
      </header>
      
      <main className="App-main">
        {/* 用戶信息區域 */}
        <UserInfo />

        {/* CSV 上傳區域 */}
        <section className="upload-section">
          <CSVUploader onUpload={handleCSVUpload} />
        </section>

        {/* 主要頁籤區域 */}
        {columns.length > 0 && (
          <section className="main-tabs-section">
            <TabPanel defaultTab={0}>
              {/* 圖表頁籤 */}
              <Tab title="📊 圖表">
                <div className="chart-tab-content">
                  {/* 欄位選擇區域 */}
                  <div className="field-selection-section">
                    <FieldSelector 
                      columns={columns}
                      csvData={csvData}
                      selectedXAxis={selectedXAxis}
                      selectedYAxis={selectedYAxis}
                      onXAxisChange={handleXAxisChange}
                      onYAxisChange={handleYAxisChange}
                    />
                  </div>

                  {/* 圖表控制與顯示區域 */}
                  {csvData && selectedXAxis && selectedYAxis.length > 0 && (
                    <div className="chart-section">
                      <div className="chart-controls">
                        <button 
                          className={`chart-type-btn ${chartType === CHART_TYPES.LINE ? 'active' : ''}`}
                          onClick={toggleChartType}
                        >
                          {chartType === CHART_TYPES.LINE ? '摺線圖' : '長條圖'}
                        </button>
                      </div>
                      
                      <ChartDisplay 
                        data={csvData}
                        xAxis={selectedXAxis}
                        yAxis={selectedYAxis}
                        chartType={chartType}
                      />
                    </div>
                  )}
                </div>
              </Tab>

              {/* 資料頁籤 */}
              <Tab title="📋 資料">
                <div className="data-tab-content">
                  <DataTable 
                    data={csvData}
                    columns={columns}
                  />
                </div>
              </Tab>
            </TabPanel>
          </section>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default App; 