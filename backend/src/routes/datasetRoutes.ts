import express, { Request, Response } from 'express';
import multer from 'multer';
import Papa, { ParseResult } from 'papaparse';
import crypto from 'crypto';
import Dataset from '../models/Dataset';
import DataRecord from '../models/DataRecord';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 常數定義
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 5000; // 最大資料列數
const MAX_COLUMNS = 100; // 最大欄位數

// 介面定義
interface CSVData {
  [key: string]: string | number;
}

// 重複檢查相關介面
interface DuplicateCheckRequest {
  columns: string[];
  rows: CSVData[];
  datasetId?: number;
}

interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicateCount: number;
  duplicateRows: CSVData[];
  existingDataCount: number;
}

// 設定 multer 檔案上傳中間件
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile?: boolean) => void) => {
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'text/plain'
    ];
    
    const fileName = file.originalname.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isMimeTypeValid = allowedMimeTypes.includes(file.mimetype) || file.mimetype === '';
    
    if (isCSV && isMimeTypeValid) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳 CSV 檔案'), false);
    }
  }
});

// 生成資料行的雜湊值
const generateRowHash = (row: CSVData, columns: string[]): string => {
  const dataString = columns.sort().map(col => String(row[col] || '')).join('|');
  return crypto.createHash('sha256').update(dataString).digest('hex');
};

// 驗證 CSV 資料格式
const validateCSVData = (data: CSVData[], columns: string[]): string[] => {
  const errors: string[] = [];
  
  if (columns.length === 0) {
    errors.push('找不到有效的欄位');
  }
  
  if (columns.length > MAX_COLUMNS) {
    errors.push(`欄位數量超過限制（最大 ${MAX_COLUMNS} 個）`);
  }
  
  if (data.length === 0) {
    errors.push('找不到有效的資料');
  }
  
  if (data.length > MAX_ROWS) {
    errors.push(`資料筆數超過限制（最大 ${MAX_ROWS} 筆）`);
  }
  
  const emptyColumns = columns.filter(col => !col || col.trim() === '');
  if (emptyColumns.length > 0) {
    errors.push('發現空白的欄位名稱');
  }
  
  const uniqueColumns = [...new Set(columns)];
  if (uniqueColumns.length !== columns.length) {
    errors.push('發現重複的欄位名稱');
  }
  
  return errors;
};

// 清理和處理 CSV 資料
const processCSVData = (data: CSVData[], columns: string[]): CSVData[] => {
  const cleanedData = data.filter(row => {
    return columns.some(col => {
      const value = row[col];
      return value !== null && value !== undefined && value !== '';
    });
  });
  
  const processedData = cleanedData.map(row => {
    const processedRow: CSVData = {};
    
    columns.forEach(col => {
      let value = row[col];
      
      if (value === null || value === undefined) {
        value = '';
      }
      
      if (typeof value === 'string') {
        value = value.trim();
      }
      
      processedRow[col] = value;
    });
    
    return processedRow;
  });
  
  return processedData;
};

// 檢查重複資料
const checkDuplicateData = async (newRows: CSVData[], newColumns: string[], datasetId: number): Promise<DuplicateCheckResult> => {
  try {
    const existingRecords = await DataRecord.findAll({
      where: {
        datasetId: datasetId
      }
    });
    
    const duplicateRows: CSVData[] = [];
    const existingDataCount = existingRecords.length;
    
    // 生成新資料的雜湊值
    const newRowsWithHashes = newRows.map(row => ({
      row,
      hash: generateRowHash(row, newColumns)
    }));
    
    // 檢查重複
    const existingHashes = existingRecords.map(record => record.rowHash);
    
    for (const { row, hash } of newRowsWithHashes) {
      if (existingHashes.includes(hash)) {
        duplicateRows.push(row);
      }
    }
    
    return {
      hasDuplicates: duplicateRows.length > 0,
      duplicateCount: duplicateRows.length,
      duplicateRows,
      existingDataCount
    };
  } catch (error) {
    console.error('重複檢查錯誤:', error);
    throw error;
  }
};

// 獲取用戶的所有資料集
router.get('/datasets', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const datasets = await Dataset.findAll({
      where: {
        userId: userId
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: datasets
    });
  } catch (error) {
    console.error('獲取資料集錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
});

// 獲取特定資料集的詳細資料
router.get('/datasets/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const datasetId = parseInt(req.params.id);
    
    const dataset = await Dataset.findOne({
      where: {
        id: datasetId,
        userId: userId
      }
    });
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: '找不到資料集'
      });
    }
    
    const records = await DataRecord.findAll({
      where: {
        datasetId: datasetId
      },
      order: [['createdAt', 'DESC']]
    });
    
    const columns = JSON.parse(dataset.columnsInfo);
    
    res.json({
      success: true,
      data: {
        dataset,
        records,
        columns,
        totalRecords: records.length
      }
    });
  } catch (error) {
    console.error('獲取資料集詳細資料錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
});

// 重複檢查 API
router.post('/datasets/:id/check-duplicates', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const datasetId = parseInt(req.params.id);
    const { columns, rows }: DuplicateCheckRequest = req.body;
    
    // 驗證資料集權限
    const dataset = await Dataset.findOne({
      where: {
        id: datasetId,
        userId: userId
      }
    });
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: '找不到資料集'
      });
    }
    
    // 驗證欄位結構
    const existingColumns = JSON.parse(dataset.columnsInfo);
    if (JSON.stringify(columns.sort()) !== JSON.stringify(existingColumns.sort())) {
      return res.status(400).json({
        success: false,
        error: '欄位結構不符合資料集定義'
      });
    }
    
    // 執行重複檢查
    const duplicateResult = await checkDuplicateData(rows, columns, datasetId);
    
    res.json({
      success: true,
      data: duplicateResult
    });
  } catch (error) {
    console.error('重複檢查錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
});

// 部分上傳 API
router.post('/datasets/:id/partial-upload', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const datasetId = parseInt(req.params.id);
    const { columns, rows }: { columns: string[], rows: CSVData[] } = req.body;
    
    // 驗證資料集權限
    const dataset = await Dataset.findOne({
      where: {
        id: datasetId,
        userId: userId
      }
    });
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: '找不到資料集'
      });
    }
    
    // 處理資料
    const processedRows = processCSVData(rows, columns);
    
    // 儲存資料記錄
    const dataRecords = processedRows.map(row => ({
      datasetId: datasetId,
      dataJson: JSON.stringify(row),
      rowHash: generateRowHash(row, columns)
    }));
    
    await DataRecord.bulkCreate(dataRecords);
    
    res.json({
      success: true,
      message: `成功上傳 ${processedRows.length} 筆資料`,
      data: {
        uploadedCount: processedRows.length
      }
    });
  } catch (error) {
    console.error('部分上傳錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
});

// 創建新資料集 API
router.post('/datasets', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, columns }: { name: string, description?: string, columns: string[] } = req.body;
    
    // 驗證輸入
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: '資料集名稱不能為空'
      });
    }
    
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({
        success: false,
        error: '欄位資訊不能為空'
      });
    }
    
    // 檢查是否已存在相同名稱的資料集
    const existingDataset = await Dataset.findOne({
      where: {
        name: name.trim(),
        userId: userId
      }
    });
    
    if (existingDataset) {
      return res.status(409).json({
        success: false,
        error: '資料集名稱已存在'
      });
    }
    
    // 創建新資料集
    const dataset = await Dataset.create({
      name: name.trim(),
      description: description?.trim() || undefined,
      columnsInfo: JSON.stringify(columns),
      userId: userId
    });
    
    res.json({
      success: true,
      message: '資料集創建成功',
      data: dataset
    });
  } catch (error) {
    console.error('創建資料集錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
});

// 檢查欄位結構是否已存在
router.post('/datasets/check-columns', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { columns }: { columns: string[] } = req.body;
    
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({
        success: false,
        error: '欄位資訊不能為空'
      });
    }
    
    // 查找具有相同欄位結構的資料集
    const datasets = await Dataset.findAll({
      where: {
        userId: userId
      }
    });
    
    const matchingDatasets = datasets.filter(dataset => {
      try {
        const datasetColumns = JSON.parse(dataset.columnsInfo);
        return JSON.stringify(columns.sort()) === JSON.stringify(datasetColumns.sort());
      } catch {
        return false;
      }
    });
    
    res.json({
      success: true,
      data: {
        hasMatching: matchingDatasets.length > 0,
        matchingDatasets: matchingDatasets,
        columnsHash: JSON.stringify(columns.sort())
      }
    });
  } catch (error) {
    console.error('檢查欄位結構錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
});

export default router; 