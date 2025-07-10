import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// 圖表類型常數
const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar'
};

// 預設顏色調色盤
const DEFAULT_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
];

function ChartDisplay({ data, xAxis, yAxis, chartType }) {
  
  // 處理圖表資料
  const chartData = useMemo(() => {
    if (!data || !xAxis || !yAxis || yAxis.length === 0) {
      return [];
    }

    return data.map(row => {
      const chartRow = { [xAxis]: row[xAxis] };
      
      // 處理 Y 軸數值欄位
      yAxis.forEach(yField => {
        const value = row[yField];
        // 嘗試轉換為數字，失敗則設為 0
        const numValue = parseFloat(value);
        chartRow[yField] = isNaN(numValue) ? 0 : numValue;
      });
      
      return chartRow;
    });
  }, [data, xAxis, yAxis]);

  // 檢查是否有有效資料
  const hasValidData = chartData.length > 0;

  // 自訂 Tooltip 格式
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${xAxis}: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 渲染摺線圖
  const renderLineChart = () => (
    <LineChart
      data={chartData}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 20,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey={xAxis}
        angle={-45}
        textAnchor="end"
        height={80}
        fontSize={12}
      />
      <YAxis fontSize={12} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      {yAxis.map((yField, index) => (
        <Line
          key={yField}
          type="monotone"
          dataKey={yField}
          stroke={DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      ))}
    </LineChart>
  );

  // 渲染長條圖
  const renderBarChart = () => (
    <BarChart
      data={chartData}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 20,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey={xAxis}
        angle={-45}
        textAnchor="end"
        height={80}
        fontSize={12}
      />
      <YAxis fontSize={12} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      {yAxis.map((yField, index) => (
        <Bar
          key={yField}
          dataKey={yField}
          fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
        />
      ))}
    </BarChart>
  );

  if (!hasValidData) {
    return (
      <div className="chart-display">
        <div className="chart-placeholder">
          <p>無法顯示圖表</p>
          <p>請檢查資料格式和欄位選擇</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-display">
      <div className="chart-header">
        <h3>
          {chartType === CHART_TYPES.LINE ? '摺線圖' : '長條圖'}
          <span className="chart-info">
            （X軸：{xAxis}，Y軸：{yAxis.join(', ')}）
          </span>
        </h3>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          {chartType === CHART_TYPES.LINE ? renderLineChart() : renderBarChart()}
        </ResponsiveContainer>
      </div>
      
      <div className="chart-stats">
        <div className="stats-item">
          <strong>資料筆數：</strong>{chartData.length}
        </div>
        <div className="stats-item">
          <strong>X 軸欄位：</strong>{xAxis}
        </div>
        <div className="stats-item">
          <strong>Y 軸欄位：</strong>{yAxis.join(', ')}
        </div>
      </div>
    </div>
  );
}

export default ChartDisplay; 