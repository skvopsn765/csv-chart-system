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
import { ChartDisplayProps, ChartDataPoint, ChartTooltipProps } from '../../../shared/types';
import { CHART_TYPES, DEFAULT_CHART_COLORS, CHART_DIMENSIONS, CHART_CONFIG } from '../../../shared/constants';

export const ChartDisplay: React.FC<ChartDisplayProps> = ({ data, xAxis, yAxis, chartType }) => {
  
  // 處理圖表資料
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!data || !xAxis || !yAxis || yAxis.length === 0) {
      return [];
    }

    return data.map(row => {
      const chartRow: ChartDataPoint = { [xAxis]: row[xAxis] };
      
      // 處理 Y 軸數值欄位
      yAxis.forEach(yField => {
        const value = row[yField];
        // 嘗試轉換為數字，失敗則設為 0
        const numValue = parseFloat(String(value));
        chartRow[yField] = isNaN(numValue) ? 0 : numValue;
      });
      
      return chartRow;
    });
  }, [data, xAxis, yAxis]);

  // 檢查是否有有效資料
  const hasValidData = chartData.length > 0;

  // 自訂 Tooltip 格式
  const CustomTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
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
  const renderLineChart = (): React.ReactElement => (
    <LineChart
      data={chartData}
      margin={CHART_DIMENSIONS.MARGIN}
    >
      <CartesianGrid strokeDasharray={CHART_CONFIG.GRID_STROKE_DASH} />
      <XAxis 
        dataKey={xAxis}
        angle={CHART_CONFIG.X_AXIS_ANGLE}
        textAnchor="end"
        height={CHART_CONFIG.X_AXIS_HEIGHT}
        fontSize={CHART_CONFIG.FONT_SIZE}
      />
      <YAxis fontSize={CHART_CONFIG.FONT_SIZE} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      {yAxis.map((yField, index) => (
        <Line
          key={yField}
          type="monotone"
          dataKey={yField}
          stroke={DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]}
          strokeWidth={CHART_CONFIG.STROKE_WIDTH}
          dot={{ r: CHART_CONFIG.DOT_RADIUS }}
          activeDot={{ r: CHART_CONFIG.ACTIVE_DOT_RADIUS }}
        />
      ))}
    </LineChart>
  );

  // 渲染長條圖
  const renderBarChart = (): React.ReactElement => (
    <BarChart
      data={chartData}
      margin={CHART_DIMENSIONS.MARGIN}
    >
      <CartesianGrid strokeDasharray={CHART_CONFIG.GRID_STROKE_DASH} />
      <XAxis 
        dataKey={xAxis}
        angle={CHART_CONFIG.X_AXIS_ANGLE}
        textAnchor="end"
        height={CHART_CONFIG.X_AXIS_HEIGHT}
        fontSize={CHART_CONFIG.FONT_SIZE}
      />
      <YAxis fontSize={CHART_CONFIG.FONT_SIZE} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      {yAxis.map((yField, index) => (
        <Bar
          key={yField}
          dataKey={yField}
          fill={DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]}
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
        <ResponsiveContainer width="100%" height={CHART_DIMENSIONS.DEFAULT_HEIGHT}>
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
}; 