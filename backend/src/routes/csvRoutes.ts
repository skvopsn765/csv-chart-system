import express, { Request, Response } from 'express';
import multer from 'multer';
import Papa from 'papaparse';
import Upload from '../models/Upload';

const router = express.Router();

// 檔案大小和數量限制常數
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 5000;
const MAX_COLUMNS = 100;

// 定義資料結構介面
interface CSVData {
  [key: string]: string | number;
}

interface ProcessedCSVData {
  columns: string[];
  rows: CSVData[];
  summary: {
    totalRows: number;
    totalColumns: number;
    fileName: string;
    fileSize: number;
    uploadDate?: Date;
  };
}

// 設定 multer 檔案上傳中間件
const upload = multer({
  storage: multer.memoryStorage(), // 存儲在記憶體中
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // 只允許一個檔案
  },
  fileFilter: (req, file, cb) => {
    // 檢查檔案類型
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'text/plain'
    ];
    
    // 檢查副檔名
    const fileName = file.originalname.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    
    // 檢查 MIME 類型
    const isMimeTypeValid = allowedMimeTypes.includes(file.mimetype) || file.mimetype === '';
    
    if (isCSV && isMimeTypeValid) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳 CSV 檔案'), false);
    }
  }
});

// 驗證 CSV 資料格式
const validateCSVData = (data: CSVData[], columns: string[]): string[] => {
  const errors: string[] = [];
  
  // 檢查欄位數量
  if (columns.length === 0) {
    errors.push('找不到有效的欄位');
  }
  
  if (columns.length > MAX_COLUMNS) {
    errors.push(`欄位數量超過限制（最大 ${MAX_COLUMNS} 個）`);
  }
  
  // 檢查資料筆數
  if (data.length === 0) {
    errors.push('找不到有效的資料');
  }
  
  if (data.length > MAX_ROWS) {
    errors.push(`資料筆數超過限制（最大 ${MAX_ROWS} 筆）`);
  }
  
  // 檢查欄位名稱
  const emptyColumns = columns.filter(col => !col || col.trim() === '');
  if (emptyColumns.length > 0) {
    errors.push('發現空白的欄位名稱');
  }
  
  // 檢查重複欄位
  const uniqueColumns = [...new Set(columns)];
  if (uniqueColumns.length !== columns.length) {
    errors.push('發現重複的欄位名稱');
  }
  
  return errors;
};

// 清理和處理 CSV 資料
const processCSVData = (data: CSVData[], columns: string[]): CSVData[] => {
  // 移除完全空白的資料行
  const cleanedData = data.filter(row => {
    return columns.some(col => {
      const value = row[col];
      return value !== null && value !== undefined && value !== '';
    });
  });
  
  // 處理資料類型
  const processedData = cleanedData.map(row => {
    const processedRow: CSVData = {};
    
    columns.forEach(col => {
      let value = row[col];
      
      // 處理空值
      if (value === null || value === undefined) {
        value = '';
      }
      
      // 移除前後空白
      if (typeof value === 'string') {
        value = value.trim();
      }
      
      processedRow[col] = value;
    });
    
    return processedRow;
  });
  
  return processedData;
};

// 擴展 Request 介面以包含 file 屬性
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// POST /api/upload-csv - 上傳 CSV 檔案
router.post('/upload-csv', upload.single('csvFile'), async (req: RequestWithFile, res: Response) => {
  try {
    // 檢查是否有上傳檔案
    if (!req.file) {
      return res.status(400).json({
        error: '請選擇一個 CSV 檔案'
      });
    }
    
    // 解析 CSV 內容
    const csvText = req.file.buffer.toString('utf8');
    
    // 使用 Papa Parse 解析 CSV
    const parseResult = Papa.parse(csvText, {
      header: true, // 使用第一行作為標題
      skipEmptyLines: true,
      encoding: 'UTF-8',
      transformHeader: (header: string) => {
        // 清理標題，移除前後空白
        return header.trim();
      }
    });
    
    // 檢查解析錯誤
    if (parseResult.errors.length > 0) {
      const errorMessages = parseResult.errors.map(err => err.message).join(', ');
      return res.status(400).json({
        error: 'CSV 檔案格式錯誤',
        details: errorMessages
      });
    }
    
    // 取得解析後的資料和欄位
    const { data, meta } = parseResult;
    const columns = meta.fields || [];
    
    // 驗證資料格式
    const validationErrors = validateCSVData(data as CSVData[], columns);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: '資料驗證失敗',
        details: validationErrors
      });
    }
    
    // 清理和處理資料
    const processedData = processCSVData(data as CSVData[], columns);
    
    // 儲存到資料庫 (相當於 .NET 的 context.Add() 和 SaveChanges())
    const uploadRecord = await Upload.create({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      columnsInfo: JSON.stringify(columns),
      dataJson: JSON.stringify(processedData),
      rowCount: processedData.length,
      columnCount: columns.length
    });
    
    console.log(`📊 CSV 資料已儲存到資料庫，ID: ${uploadRecord.id}`);
    
    // 回傳成功結果
    res.json({
      success: true,
      message: 'CSV 檔案上傳並儲存成功',
      uploadId: uploadRecord.id,  // 回傳資料庫 ID
      data: {
        columns: columns,
        rows: processedData,
        summary: {
          totalRows: processedData.length,
          totalColumns: columns.length,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          uploadDate: uploadRecord.createdAt
        }
      }
    });
    
  } catch (error) {
    console.error('CSV 上傳處理錯誤:', error);
    
    // 處理特定錯誤
    if (error instanceof Error && error.message.includes('只允許上傳 CSV 檔案')) {
      return res.status(400).json({
        error: '檔案格式不正確',
        details: '請選擇 .csv 檔案'
      });
    }
    
    res.status(500).json({
      error: '伺服器處理錯誤',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

// GET /api/test - 測試端點
router.get('/test', (req: Request, res: Response) => {
  res.json({
    message: 'CSV API 正常運作',
    timestamp: new Date().toISOString(),
    limits: {
      maxFileSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      maxRows: MAX_ROWS,
      maxColumns: MAX_COLUMNS
    }
  });
});

// GET /api/uploads - 取得歷史上傳記錄
router.get('/uploads', async (req: Request, res: Response) => {
  try {
    const uploads = await Upload.findAll({
      attributes: [
        'id', 
        'fileName', 
        'fileSize', 
        'rowCount', 
        'columnCount',
        'createdAt',
        'updatedAt'
      ],
      order: [['createdAt', 'DESC']]  // 按上傳時間倒序
    });
    
    res.json({
      success: true,
      message: '取得上傳記錄成功',
      data: uploads
    });
    
  } catch (error) {
    console.error('取得上傳記錄錯誤:', error);
    res.status(500).json({
      error: '取得上傳記錄失敗',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

// GET /api/uploads/:id - 取得特定上傳記錄的完整資料
router.get('/uploads/:id', async (req: Request, res: Response) => {
  try {
    const uploadId = parseInt(req.params.id);
    
    if (isNaN(uploadId)) {
      return res.status(400).json({
        error: '無效的上傳記錄 ID'
      });
    }
    
    const upload = await Upload.findByPk(uploadId);
    
    if (!upload) {
      return res.status(404).json({
        error: '找不到指定的上傳記錄'
      });
    }
    
    // 解析 JSON 資料
    const columns = JSON.parse(upload.columnsInfo);
    const rows = JSON.parse(upload.dataJson);
    
    res.json({
      success: true,
      message: '取得上傳記錄成功',
      data: {
        id: upload.id,
        fileName: upload.fileName,
        fileSize: upload.fileSize,
        uploadDate: upload.createdAt,
        columns: columns,
        rows: rows,
        summary: {
          totalRows: upload.rowCount,
          totalColumns: upload.columnCount
        }
      }
    });
    
  } catch (error) {
    console.error('取得上傳記錄錯誤:', error);
    res.status(500).json({
      error: '取得上傳記錄失敗',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

export default router; 