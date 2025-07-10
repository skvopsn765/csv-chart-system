import React, { useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { CSVUploader, FieldSelector, ChartDisplay, DataTable, AdminLayout } from './components';
import { ProtectedRoute, AuthProvider } from './features/auth';
import { CHART_TYPES } from './shared/constants';
import { ChartType, DataRow } from './shared/types';
import zhTW from 'antd/locale/zh_TW';
import './App.css';

const AppContent: React.FC = () => {
  // 主要狀態管理
  const [csvData, setCsvData] = useState<DataRow[] | null>(null); // CSV 解析後的資料
  const [columns, setColumns] = useState<string[]>([]); // 欄位名稱陣列
  const [selectedXAxis, setSelectedXAxis] = useState<string>(''); // 選擇的 X 軸欄位
  const [selectedYAxis, setSelectedYAxis] = useState<string[]>([]); // 選擇的 Y 軸欄位陣列
  const [chartType, setChartType] = useState<ChartType>(CHART_TYPES.LINE); // 圖表類型
  const [currentPage, setCurrentPage] = useState<string>('dashboard'); // 目前頁面

  // 處理 CSV 上傳成功
  const handleCSVUpload = (data: DataRow[], columnsData: string[]): void => {
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

  // 處理選單選擇
  const handleMenuSelect = (key: string): void => {
    setCurrentPage(key);
  };

  // 渲染頁面內容
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <h2>儀表板</h2>
            <p>歡迎使用 CSV 管理系統！</p>
            {csvData && (
              <div className="dashboard-stats">
                <div className="stat-card">
                  <h3>資料筆數</h3>
                  <p>{csvData.length}</p>
                </div>
                <div className="stat-card">
                  <h3>欄位數量</h3>
                  <p>{columns.length}</p>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'csv-upload':
        return (
          <div className="csv-upload-content">
            <h2>CSV 上傳</h2>
            <CSVUploader onUpload={handleCSVUpload} />
          </div>
        );
      
      case 'data-table':
        return (
          <div className="data-table-content">
            <h2>資料表格</h2>
            <DataTable 
              data={csvData}
              columns={columns}
            />
          </div>
        );
      
      case 'charts':
        return (
          <div className="charts-content">
            <h2>圖表分析</h2>
            {columns.length > 0 ? (
              <>
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
              </>
            ) : (
              <p>請先上傳 CSV 檔案以開始分析</p>
            )}
          </div>
        );
      
      case 'settings':
        return (
          <div className="settings-content">
            <h2>系統設定</h2>
            <p>系統設定功能開發中...</p>
          </div>
        );
      
      default:
        return <div>頁面未找到</div>;
    }
  };

  return (
    <AdminLayout 
      currentPage={currentPage}
      onMenuSelect={handleMenuSelect}
    >
      {renderPageContent()}
    </AdminLayout>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
      <AuthProvider>
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App; 