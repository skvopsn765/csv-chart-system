import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartDisplayProps, ChartDataPoint, ChartTooltipProps, SortOrder, TrendLinePoint } from '../../../shared/types';
import { CHART_TYPES, DEFAULT_CHART_COLORS, CHART_DIMENSIONS, CHART_CONFIG, SORT_ORDERS } from '../../../shared/constants';

export const ChartDisplay: React.FC<ChartDisplayProps> = ({ data, xAxis, yAxis, chartType, sortOrder = SORT_ORDERS.NONE, showTrendLine = false }) => {
  
  // 線性回歸計算函數
  const calculateLinearRegression = (xValues: number[], yValues: number[]): { slope: number, intercept: number } => {
    const n = xValues.length;
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  };

  // 檢查欄位是否為數值型
  const isNumericField = (fieldName: string, data: ChartDataPoint[]): boolean => {
    if (!data || data.length === 0) return false;
    
    // 檢查前幾筆資料
    const sampleSize = Math.min(10, data.length);
    let numericCount = 0;
    
    for (let i = 0; i < sampleSize; i++) {
      const value = data[i][fieldName];
      if (value !== null && value !== undefined && value !== '') {
        const numValue = parseFloat(String(value));
        if (!isNaN(numValue)) {
          numericCount++;
        }
      }
    }
    
    return numericCount / sampleSize > 0.7; // 70% 以上為數值
  };
  
  // 處理圖表資料和趨勢線資料
  const { chartData, trendLineData } = useMemo((): { chartData: ChartDataPoint[], trendLineData: TrendLinePoint[] } => {
    if (!data || !xAxis || !yAxis || yAxis.length === 0) {
      return { chartData: [], trendLineData: [] };
    }

    const processedData = data.map(row => {
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

    // 根據排序設定進行排序
    let sortedData = processedData;
    if (sortOrder !== SORT_ORDERS.NONE) {
      sortedData = processedData.sort((a, b) => {
        const aValue = a[xAxis];
        const bValue = b[xAxis];
        
        // 處理數值類型的排序
        const aNum = parseFloat(String(aValue));
        const bNum = parseFloat(String(bValue));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          // 數值排序
          return sortOrder === SORT_ORDERS.ASC ? aNum - bNum : bNum - aNum;
        } else {
          // 字串排序
          const aStr = String(aValue);
          const bStr = String(bValue);
          
          if (sortOrder === SORT_ORDERS.ASC) {
            return aStr.localeCompare(bStr);
          } else {
            return bStr.localeCompare(aStr);
          }
        }
      });
    }

    // 計算趨勢線資料並合併到主要資料中
    let trendData: TrendLinePoint[] = [];
    let mergedData = [...sortedData];
    
    if (showTrendLine && sortedData.length > 1) {
      // 檢查 X 軸是否為數值型
      const isXNumeric = isNumericField(xAxis, sortedData);
      
      if (isXNumeric) {
        // 為每個 Y 軸欄位計算趨勢線
        yAxis.forEach(yField => {
          // 過濾出有效的數值資料點
          const validPoints = sortedData.filter(row => {
            const xVal = parseFloat(String(row[xAxis]));
            const yVal = parseFloat(String(row[yField]));
            return !isNaN(xVal) && !isNaN(yVal);
          });
          
          if (validPoints.length > 1) {
            const xValues = validPoints.map(row => parseFloat(String(row[xAxis])));
            const yValues = validPoints.map(row => parseFloat(String(row[yField])));
            
            const { slope, intercept } = calculateLinearRegression(xValues, yValues);
            
            // 計算趨勢線的起點和終點
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            
            // 將趨勢線資料添加到主要資料中
            mergedData.forEach(row => {
              const xVal = parseFloat(String(row[xAxis]));
              if (!isNaN(xVal) && xVal >= minX && xVal <= maxX) {
                row[`${yField}_trend`] = slope * xVal + intercept;
              }
            });
          }
        });
      }
    }

    return { chartData: mergedData, trendLineData: trendData };
  }, [data, xAxis, yAxis, sortOrder, showTrendLine]);

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
      {/* 趨勢線 */}
      {showTrendLine && yAxis.map((yField, index) => {
        const trendFieldName = `${yField}_trend`;
        const trendColor = DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length];
        
        // 檢查是否有趨勢線數據
        const hasTrendData = chartData.some(row => row[trendFieldName] !== undefined);
        
        return hasTrendData ? (
          <Line
            key={`${yField}_trend`}
            type="linear"
            dataKey={trendFieldName}
            stroke={trendColor}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
            name={`${yField} 趨勢線`}
            connectNulls={false}
          />
        ) : null;
      })}
    </LineChart>
  );

  // 渲染長條圖
  const renderBarChart = (): React.ReactElement => (
    <ComposedChart
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
      {/* 趨勢線 */}
      {showTrendLine && yAxis.map((yField, index) => {
        const trendFieldName = `${yField}_trend`;
        const trendColor = DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length];
        
        // 檢查是否有趨勢線數據
        const hasTrendData = chartData.some(row => row[trendFieldName] !== undefined);
        
        return hasTrendData ? (
          <Line
            key={`${yField}_trend`}
            type="linear"
            dataKey={trendFieldName}
            stroke={trendColor}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
            name={`${yField} 趨勢線`}
            connectNulls={false}
          />
        ) : null;
      })}
    </ComposedChart>
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
            （X軸：{xAxis}，Y軸：{yAxis.join(', ')}
            {sortOrder !== SORT_ORDERS.NONE && (
              <>
                ，排序：{sortOrder === SORT_ORDERS.ASC ? '升序' : '降序'}
              </>
            )}
            {showTrendLine && (
              <>
                ，趨勢線：已啟用
              </>
            )}
            ）
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
        {sortOrder !== SORT_ORDERS.NONE && (
          <div className="stats-item">
            <strong>排序方式：</strong>{sortOrder === SORT_ORDERS.ASC ? '升序（由小到大）' : '降序（由大到小）'}
          </div>
        )}
        {showTrendLine && (
          <div className="stats-item">
            <strong>趨勢線：</strong>
            {(() => {
              // 檢查有多少條趨勢線實際被顯示
              const displayedTrendLines = yAxis.filter(yField => 
                chartData.some(row => row[`${yField}_trend`] !== undefined)
              );
              
              return displayedTrendLines.length > 0 ? 
                `已顯示 ${displayedTrendLines.length} 條趨勢線` : 
                '需要數值型 X 軸才能顯示趨勢線';
            })()}
          </div>
        )}
      </div>
    </div>
  );
}; 