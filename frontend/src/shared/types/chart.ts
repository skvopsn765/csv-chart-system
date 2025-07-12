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
  showTrendLine?: boolean;
}

// 圖表資料點
export interface ChartDataPoint {
  [key: string]: string | number | null;
}

// 趨勢線資料點
export interface TrendLinePoint {
  x: number;
  y: number;
  [key: string]: number;
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

// 資料量選項
export type DataLimitOption = 100 | 500 | 'all';

// 通用圖表分析組件的資料來源介面
export interface GenericChartDataSource {
  fetchData: (limit?: DataLimitOption) => Promise<DataRow[]>;
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