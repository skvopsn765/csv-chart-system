// 共享類型定義
import React from 'react';

export interface DataRow {
  [key: string]: string | number | null;
}

export interface CSVData {
  headers: string[];
  data: DataRow[];
}

export interface TabProps {
  title: string;
  children: React.ReactNode;
}

export interface TabPanelProps {
  children: React.ReactElement<TabProps>[];
}

export interface DataTableProps {
  csvData: CSVData;
}

export interface ChartDisplayProps {
  csvData: CSVData;
  xField: string;
  yField: string;
  chartType: ChartType;
}

export interface FieldSelectorProps {
  headers: string[];
  onFieldChange: (xField: string, yField: string) => void;
  onChartTypeChange: (chartType: ChartType) => void;
}

export interface CSVUploaderProps {
  onDataUpload: (data: CSVData) => void;
}

export type ChartType = 'line' | 'bar' | 'area' | 'scatter' | 'pie';

export interface ChartConfig {
  type: ChartType;
  xField: string;
  yField: string;
  title?: string;
  color?: string;
} 