import React, { useState } from 'react';
import CSVUploader from './components/CSVUploader';
import FieldSelector from './components/FieldSelector';
import ChartDisplay from './components/ChartDisplay';
import './App.css';

// 圖表類型常數
const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar'
};

function App() {
  // 主要狀態管理
  const [csvData, setCsvData] = useState(null); // CSV 解析後的資料
  const [columns, setColumns] = useState([]); // 欄位名稱陣列
  const [selectedXAxis, setSelectedXAxis] = useState(''); // 選擇的 X 軸欄位
  const [selectedYAxis, setSelectedYAxis] = useState([]); // 選擇的 Y 軸欄位陣列
  const [chartType, setChartType] = useState(CHART_TYPES.LINE); // 圖表類型

  // 處理 CSV 上傳成功
  const handleCSVUpload = (data, columnsData) => {
    setCsvData(data);
    setColumns(columnsData);
    // 重置選擇的欄位
    setSelectedXAxis('');
    setSelectedYAxis([]);
  };

  // 處理 X 軸欄位選擇
  const handleXAxisChange = (fieldName) => {
    setSelectedXAxis(fieldName);
  };

  // 處理 Y 軸欄位選擇
  const handleYAxisChange = (fieldNames) => {
    setSelectedYAxis(fieldNames);
  };

  // 切換圖表類型
  const toggleChartType = () => {
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
        {/* CSV 上傳區域 */}
        <section className="upload-section">
          <CSVUploader onUpload={handleCSVUpload} />
        </section>

        {/* 欄位選擇區域 */}
        {columns.length > 0 && (
          <section className="field-selection-section">
            <FieldSelector 
              columns={columns}
              csvData={csvData}
              selectedXAxis={selectedXAxis}
              selectedYAxis={selectedYAxis}
              onXAxisChange={handleXAxisChange}
              onYAxisChange={handleYAxisChange}
            />
          </section>
        )}

        {/* 圖表控制與顯示區域 */}
        {csvData && selectedXAxis && selectedYAxis.length > 0 && (
          <section className="chart-section">
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
          </section>
        )}
      </main>
    </div>
  );
}

export default App; 