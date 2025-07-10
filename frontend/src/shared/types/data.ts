// 資料相關類型定義

export interface DataRow {
  [key: string]: string | number | null;
}

export interface CSVData {
  columns: string[];
  rows: DataRow[];
}

// 重複檢查相關類型
export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicateCount: number;
  duplicateRows: DataRow[];
  existingDataCount: number;
}

export interface DuplicateCheckResponse {
  success: boolean;
  data?: DuplicateCheckResult;
  error?: string;
  details?: string;
}

// 與後端 API 回應相符的資料結構
export interface CSVParseResponse {
  success: boolean;
  data?: CSVData;
  error?: string;
  details?: string;
  duplicateCheck?: DuplicateCheckResult;
  message?: string;
}

// 上傳記錄相關類型
export interface UploadRecord {
  id: number;
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  createdAt: string;
}

// 資料集相關類型
export interface Dataset {
  id: number;
  name: string;
  description?: string;
  columnsInfo: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// 資料記錄相關類型
export interface DataRecord {
  id: number;
  datasetId: number;
  dataJson: string;
  rowHash: string;
  createdAt: string;
  updatedAt: string;
}

// 資料集列表回應
export interface DatasetsListResponse {
  success: boolean;
  data?: Dataset[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
  };
  error?: string;
}

// 資料集詳細回應
export interface DatasetDetailResponse {
  success: boolean;
  data?: {
    dataset: Dataset;
    records: DataRecord[];
    columns: string[];
    totalRecords: number;
  };
  error?: string;
}

export interface UploadDetailResponse {
  success: boolean;
  data?: {
    id: number;
    fileName: string;
    fileSize: number;
    uploadDate: string;
    columns: string[];
    rows: DataRow[];
    summary: {
      totalRows: number;
      totalColumns: number;
    };
  };
  error?: string;
}

export interface UploadsListResponse {
  success: boolean;
  data?: UploadRecord[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
  };
  error?: string;
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