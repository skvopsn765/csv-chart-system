// 圖表相關類型定義

import { DataRow } from './data';

// 圖表類型枚舉
export type ChartType = 'line' | 'bar';

// 排序類型枚舉
export type SortOrder = 'asc' | 'desc' | 'none';

// 圖表顯示組件屬性
export interface ChartDisplayProps {
  data: DataRow[] | null;
  xAxis: string;
  yAxis: string[];
  chartType: ChartType;
  sortOrder?: SortOrder;
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

// 通用圖表分析組件的資料來源介面
export interface GenericChartDataSource {
  fetchData: () => Promise<DataRow[]>;
  columns: string[];
  title: string;
  loading?: boolean;
}

// 通用圖表分析組件屬性
export interface GenericChartAnalysisProps {
  dataSource: GenericChartDataSource;
  showDataSourceInfo?: boolean;
  className?: string;
} 