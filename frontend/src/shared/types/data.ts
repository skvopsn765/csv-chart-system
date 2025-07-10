// 資料相關類型定義

export interface DataRow {
  [key: string]: string | number | null;
}

export interface CSVData {
  columns: string[];
  rows: DataRow[];
}

// 與後端 API 回應相符的資料結構
export interface CSVParseResponse {
  success: boolean;
  data?: CSVData;
  error?: string;
  details?: string;
}

// CSV 上傳器相關類型
export interface CSVUploaderProps {
  onUpload: (rows: DataRow[], columns: string[]) => void;
}

// 資料表格相關類型
export interface DataTableProps {
  data: DataRow[] | null;
  columns: string[];
}

// 欄位選擇器相關類型
export interface FieldSelectorProps {
  columns: string[];
  csvData: DataRow[] | null;
  selectedXAxis: string;
  selectedYAxis: string[];
  onXAxisChange: (field: string) => void;
  onYAxisChange: (fields: string[]) => void;
} 