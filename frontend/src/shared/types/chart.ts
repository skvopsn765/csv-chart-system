// 圖表相關類型定義

import { DataRow } from './data';

// 圖表類型枚舉
export type ChartType = 'line' | 'bar';

// 圖表配置
export interface ChartConfig {
  type: ChartType;
  xField: string;
  yFields: string[];
  title?: string;
  colors?: string[];
}

// 圖表顯示組件屬性
export interface ChartDisplayProps {
  data: DataRow[] | null;
  xAxis: string;
  yAxis: string[];
  chartType: ChartType;
}

// 圖表資料點
export interface ChartDataPoint {
  [key: string]: string | number | null;
}

// 圖表工具提示屬性
export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: string | number;
    color: string;
  }>;
  label?: string;
} 