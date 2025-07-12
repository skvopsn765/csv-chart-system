import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import Papa, { ParseResult } from 'papaparse';
import { authenticateToken } from '../middleware/auth';
import Upload from '../models/Upload';
import User from '../models/User';
import Dataset from '../models/Dataset';
import DataRecord from '../models/DataRecord';
import { Op } from 'sequelize';

const router = express.Router();

// 檔案上傳限制常數
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 50000; // 最大資料行數
const MAX_COLUMNS = 100; // 最大欄位數

// CSV 資料類型定義
interface CSVData {
  [key: string]: string | number;
}

// 重複檢查請求介面
interface DuplicateCheckRequest {
  columns: string[];
  rows: CSVData[];
}

// 重複檢查結果介面
interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicateCount: number;
  duplicateRows: CSVData[];
  existingDataCount: number;
}

// 處理後的 CSV 資料格式
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

// 設定 Multer 中間件進行檔案上傳
const upload = multer({
  storage: multer.memoryStorage(), // 使用記憶體儲存
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // 只允許一個檔案
  },
  fileFilter: (req: Request, file: any, cb: (error: Error | null, acceptFile?: boolean) => void) => {
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

// 重複檢查函數 - 比較兩個資料行是否完全相同
const isRowDuplicate = (row1: CSVData, row2: CSVData, columns: string[]): boolean => {
  // 所有欄位都必須相同才算重複
  return columns.every(col => {
    const value1 = row1[col];
    const value2 = row2[col];
    
    // 處理空值比較
    if (value1 === null || value1 === undefined || value1 === '') {
      return value2 === null || value2 === undefined || value2 === '';
    }
    
    // 轉換為字串並去除空白進行比較
    const str1 = String(value1).trim();
    const str2 = String(value2).trim();
    
    return str1 === str2;
  });
};

// 檢查新資料是否與現有資料重複
const checkDuplicateData = async (newRows: CSVData[], newColumns: string[], userId: number): Promise<DuplicateCheckResult> => {
  try {
    // 取得同一用戶的所有上傳記錄
    const existingUploads = await Upload.findAll({
      where: {
        userId: userId // 只檢查同一用戶的資料
      },
      attributes: ['dataJson', 'columnsInfo']
    });
    
    const duplicateRows: CSVData[] = [];
    let existingDataCount = 0;
    
    // 檢查每個現有上傳記錄
    for (const upload of existingUploads) {
      try {
        const existingColumns = JSON.parse(upload.columnsInfo);
        const existingRows = JSON.parse(upload.dataJson);
        
        existingDataCount += existingRows.length;
        
        // 只有當欄位結構相同時才進行比較
        if (JSON.stringify(existingColumns.sort()) === JSON.stringify(newColumns.sort())) {
          // 檢查每一行新資料是否與現有資料重複
          for (const newRow of newRows) {
            const isDuplicate = existingRows.some((existingRow: CSVData) => 
              isRowDuplicate(newRow, existingRow, newColumns)
            );
            
            if (isDuplicate) {
              // 避免重複加入相同的重複資料
              const alreadyInDuplicates = duplicateRows.some(dupRow => 
                isRowDuplicate(newRow, dupRow, newColumns)
              );
              
              if (!alreadyInDuplicates) {
                duplicateRows.push(newRow);
              }
            }
          }
        }
      } catch (parseError) {
        console.error('解析現有資料時發生錯誤:', parseError);
        // 繼續處理其他記錄
      }
    }
    
    return {
      hasDuplicates: duplicateRows.length > 0,
      duplicateCount: duplicateRows.length,
      duplicateRows: duplicateRows,
      existingDataCount: existingDataCount
    };
  } catch (error) {
    console.error('檢查重複資料時發生錯誤:', error);
    throw error;
  }
};

// 擴展 Request 介面以包含 file 屬性
interface RequestWithFile extends Request {
  file?: any;
  user?: User;
  body: any;
}

// POST /api/upload-csv - 上傳 CSV 檔案 (需要認證)
router.post('/upload-csv', authenticateToken, upload.single('csvFile'), async (req: RequestWithFile, res: Response) => {
  try {
    // 檢查是否有上傳檔案
    if (!req.file) {
      return res.status(400).json({
        error: '請選擇一個 CSV 檔案'
      });
    }
    
    // 取得當前用戶 ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: '無法取得用戶資訊'
      });
    }
    
    // 檢查是否強制上傳（跳過重複檢查）
    const forceUpload = req.body.forceUpload === 'true';
    
    // 解析 CSV 內容
    const csvText = req.file.buffer.toString('utf8');
    
    // 使用 Papa Parse 解析 CSV
    const parseResult: ParseResult<CSVData> = Papa.parse(csvText, {
      header: true, // 使用第一行作為標題
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // 清理標題，移除前後空白
        return header.trim();
      }
    });
    
    // 檢查解析錯誤
    if (parseResult.errors && parseResult.errors.length > 0) {
      const errorMessages = parseResult.errors.map((err: any) => err.message).join(', ');
      return res.status(400).json({
        error: 'CSV 檔案格式錯誤',
        details: errorMessages
      });
    }
    
    // 取得解析後的資料和欄位
    const data = parseResult.data;
    const columns = parseResult.meta?.fields || [];
    
    // 驗證資料格式
    const validationErrors = validateCSVData(data, columns);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: '資料驗證失敗',
        details: validationErrors
      });
    }
    
    // 清理和處理資料
    const processedData = processCSVData(data, columns);
    
    // 如果不是強制上傳，檢查重複資料
    if (!forceUpload) {
      const duplicateResult = await checkDuplicateData(processedData, columns, userId);
      
      if (duplicateResult.hasDuplicates) {
        console.log(`🔍 發現重複資料: ${duplicateResult.duplicateCount} 筆，用戶: ${req.user?.username}`);
        return res.status(409).json({
          error: '發現重複資料',
          success: false,
          duplicateCheck: duplicateResult,
          message: `發現 ${duplicateResult.duplicateCount} 筆重複資料，是否要繼續上傳？`
        });
      }
    }
    
    // 儲存到資料庫 (相當於 .NET 的 context.Add() 和 SaveChanges())
    const uploadRecord = await Upload.create({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      columnsInfo: JSON.stringify(columns),
      dataJson: JSON.stringify(processedData),
      rowCount: processedData.length,
      columnCount: columns.length,
      userId: userId // 儲存上傳者 ID
    });
    
    console.log(`📊 CSV 資料已儲存到資料庫，ID: ${uploadRecord.id}，用戶: ${req.user?.username}`);
    
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

// POST /api/check-duplicates - 檢查重複資料 (需要認證)
router.post('/check-duplicates', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { columns, rows }: DuplicateCheckRequest = req.body;
    
    // 驗證請求資料
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({
        error: '無效的欄位資料'
      });
    }
    
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        error: '無效的資料內容'
      });
    }
    
    // 取得當前用戶 ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: '無法取得用戶資訊'
      });
    }
    
    // 檢查重複資料
    const duplicateResult = await checkDuplicateData(rows, columns, userId);
    
    res.json({
      success: true,
      data: duplicateResult
    });
    
  } catch (error) {
    console.error('檢查重複資料錯誤:', error);
    res.status(500).json({
      error: '檢查重複資料時發生錯誤',
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

// GET /api/uploads - 取得歷史上傳記錄 (需要認證)
router.get('/uploads', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // 取得當前用戶 ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: '無法取得用戶資訊'
      });
    }
    
    // 只取得該用戶的上傳記錄
    const uploads = await Upload.findAll({
      where: {
        userId: userId
      },
      attributes: ['id', 'fileName', 'fileSize', 'rowCount', 'columnCount', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: Math.min(limit, 100), // 限制最大查詢數量
      offset: offset
    });
    
    const total = await Upload.count({
      where: {
        userId: userId
      }
    });
    
    res.json({
      success: true,
      data: uploads,
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total
      }
    });
  } catch (error) {
    console.error('取得上傳記錄錯誤:', error);
    res.status(500).json({
      error: '伺服器處理錯誤',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

// GET /api/uploads/:id - 取得特定上傳記錄 (需要認證)
router.get('/uploads/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 取得當前用戶 ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: '無法取得用戶資訊'
      });
    }
    
    // 只能查看自己的上傳記錄
    const upload = await Upload.findOne({
      where: {
        id: id,
        userId: userId
      }
    });
    
    if (!upload) {
      return res.status(404).json({
        error: '找不到指定的上傳記錄'
      });
    }
    
    // 解析儲存的資料
    const columns = JSON.parse(upload.columnsInfo);
    const data = JSON.parse(upload.dataJson);
    
    res.json({
      success: true,
      data: {
        id: upload.id,
        fileName: upload.fileName,
        fileSize: upload.fileSize,
        uploadDate: upload.createdAt,
        columns,
        rows: data,
        summary: {
          totalRows: upload.rowCount,
          totalColumns: upload.columnCount
        }
      }
    });
  } catch (error) {
    console.error('取得上傳記錄錯誤:', error);
    res.status(500).json({
      error: '伺服器處理錯誤',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

// DELETE /api/uploads/:id - 刪除上傳記錄 (需要認證)
router.delete('/uploads/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 取得當前用戶 ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: '無法取得用戶資訊'
      });
    }
    
    // 只能刪除自己的上傳記錄
    const upload = await Upload.findOne({
      where: {
        id: id,
        userId: userId
      }
    });
    
    if (!upload) {
      return res.status(404).json({
        error: '找不到指定的上傳記錄'
      });
    }
    
    await upload.destroy();
    
    console.log(`🗑️ 已刪除上傳記錄，ID: ${id}，用戶: ${req.user?.username}`);
    
    res.json({
      success: true,
      message: '上傳記錄已成功刪除'
    });
  } catch (error) {
    console.error('刪除上傳記錄錯誤:', error);
    res.status(500).json({
      error: '伺服器處理錯誤',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

// GET /api/records/:id - 取得特定資料記錄 (需要認證)
router.get('/records/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 取得當前用戶 ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: '無法取得用戶資訊'
      });
    }
    
    // 查詢資料記錄
    const record = await DataRecord.findOne({
      where: { id: id }
    });
    
    if (!record) {
      return res.status(404).json({
        error: '找不到指定的資料記錄'
      });
    }
    
    // 查詢相關資料集
    const dataset = await Dataset.findOne({
      where: { id: record.datasetId },
      attributes: ['id', 'name', 'userId']
    });
    
    if (!dataset) {
      return res.status(404).json({
        error: '找不到相關的資料集'
      });
    }
    
    // 檢查是否為該用戶的資料
    if (dataset.userId !== userId) {
      return res.status(403).json({
        error: '無權限存取此資料記錄'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: record.id,
        datasetId: record.datasetId,
        dataJson: JSON.parse(record.dataJson),
        rowHash: record.rowHash,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }
    });
  } catch (error) {
    console.error('取得資料記錄錯誤:', error);
    res.status(500).json({
      error: '伺服器處理錯誤',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

// PUT /api/records/:id - 更新資料記錄 (需要認證)
router.put('/records/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dataJson } = req.body;
    
    // 取得當前用戶 ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: '無法取得用戶資訊'
      });
    }
    
    // 驗證輸入資料
    if (!dataJson || typeof dataJson !== 'object') {
      return res.status(400).json({
        error: '無效的資料格式'
      });
    }
    
    // 查詢資料記錄
    const record = await DataRecord.findOne({
      where: { id: id }
    });
    
    if (!record) {
      return res.status(404).json({
        error: '找不到指定的資料記錄'
      });
    }
    
    // 查詢相關資料集
    const dataset = await Dataset.findOne({
      where: { id: record.datasetId },
      attributes: ['id', 'name', 'userId', 'columnsInfo']
    });
    
    if (!dataset) {
      return res.status(404).json({
        error: '找不到相關的資料集'
      });
    }
    
    // 檢查是否為該用戶的資料
    if (dataset.userId !== userId) {
      return res.status(403).json({
        error: '無權限修改此資料記錄'
      });
    }
    
    // 驗證資料結構是否符合資料集欄位
    const expectedColumns = JSON.parse(dataset.columnsInfo);
    const providedColumns = Object.keys(dataJson);
    
    if (JSON.stringify(expectedColumns.sort()) !== JSON.stringify(providedColumns.sort())) {
      return res.status(400).json({
        error: '資料欄位與資料集結構不符'
      });
    }
    
    // 計算新的雜湊值
    const crypto = require('crypto');
    const newRowHash = crypto.createHash('sha256')
      .update(JSON.stringify(dataJson))
      .digest('hex');
    
    // 更新資料記錄
    await record.update({
      dataJson: JSON.stringify(dataJson),
      rowHash: newRowHash
    });
    
    console.log(`✏️ 已更新資料記錄，ID: ${id}，用戶: ${req.user?.username}`);
    
    res.json({
      success: true,
      message: '資料記錄已成功更新',
      data: {
        id: record.id,
        datasetId: record.datasetId,
        dataJson: JSON.parse(record.dataJson),
        rowHash: record.rowHash,
        updatedAt: record.updatedAt
      }
    });
  } catch (error) {
    console.error('更新資料記錄錯誤:', error);
    res.status(500).json({
      error: '伺服器處理錯誤',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

// DELETE /api/records/:id - 刪除資料記錄 (需要認證)
router.delete('/records/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 取得當前用戶 ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: '無法取得用戶資訊'
      });
    }
    
    // 查詢資料記錄
    const record = await DataRecord.findOne({
      where: { id: id }
    });
    
    if (!record) {
      return res.status(404).json({
        error: '找不到指定的資料記錄'
      });
    }
    
    // 查詢相關資料集
    const dataset = await Dataset.findOne({
      where: { id: record.datasetId },
      attributes: ['id', 'name', 'userId']
    });
    
    if (!dataset) {
      return res.status(404).json({
        error: '找不到相關的資料集'
      });
    }
    
    // 檢查是否為該用戶的資料
    if (dataset.userId !== userId) {
      return res.status(403).json({
        error: '無權限刪除此資料記錄'
      });
    }
    
    await record.destroy();
    
    console.log(`🗑️ 已刪除資料記錄，ID: ${id}，用戶: ${req.user?.username}`);
    
    res.json({
      success: true,
      message: '資料記錄已成功刪除'
    });
  } catch (error) {
    console.error('刪除資料記錄錯誤:', error);
    res.status(500).json({
      error: '伺服器處理錯誤',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

// PUT /api/datasets/:id - 更新資料集 (需要認證)
router.put('/datasets/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // 取得當前用戶 ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: '無法取得用戶資訊'
      });
    }
    
    // 驗證輸入資料
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: '資料集名稱不能為空'
      });
    }
    
    // 查詢資料集
    const dataset = await Dataset.findOne({
      where: { id: id }
    });
    
    if (!dataset) {
      return res.status(404).json({
        error: '找不到指定的資料集'
      });
    }
    
    // 檢查是否為該用戶的資料集
    if (dataset.userId !== userId) {
      return res.status(403).json({
        error: '無權限修改此資料集'
      });
    }
    
    // 檢查是否已存在相同名稱的資料集
    const existingDataset = await Dataset.findOne({
      where: {
        name: name.trim(),
        userId: userId,
        id: { [Op.ne]: id } // 排除當前資料集
      }
    });
    
    if (existingDataset) {
      return res.status(400).json({
        error: '資料集名稱已存在'
      });
    }
    
    // 更新資料集
    await dataset.update({
      name: name.trim(),
      description: description ? description.trim() : null
    });
    
    console.log(`✏️ 已更新資料集，ID: ${id}，名稱: ${name}，用戶: ${req.user?.username}`);
    
    res.json({
      success: true,
      message: '資料集已成功更新',
      data: {
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        columnsInfo: dataset.columnsInfo,
        userId: dataset.userId,
        createdAt: dataset.createdAt,
        updatedAt: dataset.updatedAt
      }
    });
  } catch (error) {
    console.error('更新資料集錯誤:', error);
    res.status(500).json({
      error: '伺服器處理錯誤',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

// DELETE /api/datasets/:id - 刪除資料集 (需要認證)
router.delete('/datasets/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 取得當前用戶 ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: '無法取得用戶資訊'
      });
    }
    
    // 查詢資料集
    const dataset = await Dataset.findOne({
      where: { id: id }
    });
    
    if (!dataset) {
      return res.status(404).json({
        error: '找不到指定的資料集'
      });
    }
    
    // 檢查是否為該用戶的資料集
    if (dataset.userId !== userId) {
      return res.status(403).json({
        error: '無權限刪除此資料集'
      });
    }
    
    // 先刪除相關的資料記錄
    await DataRecord.destroy({
      where: { datasetId: id }
    });
    
    // 刪除資料集
    await dataset.destroy();
    
    console.log(`🗑️ 已刪除資料集，ID: ${id}，名稱: ${dataset.name}，用戶: ${req.user?.username}`);
    
    res.json({
      success: true,
      message: '資料集及相關資料已成功刪除'
    });
  } catch (error) {
    console.error('刪除資料集錯誤:', error);
    res.status(500).json({
      error: '伺服器處理錯誤',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

export default router; 