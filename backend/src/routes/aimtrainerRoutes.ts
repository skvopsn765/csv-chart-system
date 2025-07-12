import express, { Request, Response } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import AimTrainerRecord from '../models/AimTrainerRecord';
import { Op } from 'sequelize';

const router = express.Router();

// 檔案上傳配置
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20 // 允許同時上傳多個檔案（增加到 20 個）
  },
  fileFilter: (req: Request, file: any, cb: (error: Error | null, acceptFile?: boolean) => void) => {
    const fileName = file.originalname.toLowerCase();
    const isValidFile = fileName.endsWith('.txt') && fileName.includes('aimtrainer_results');
    
    if (isValidFile) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳 aimtrainer_results_*.txt 檔案'), false);
    }
  }
});

// AimTrainer 記錄介面
interface AimTrainerRecordData {
  challengeName: string;
  shotsHit: number;
  kills: number;
  weapon: string;
  accuracy: number;
  damage: number;
  criticalShots: number;
  totalShots: number;
  roundTime: number;
}

// 解析 AimTrainer 檔案內容
const parseAimTrainerFile = (fileContent: string, fileName: string): AimTrainerRecordData[] => {
  const lines = fileContent.split('\n').map(line => line.trim());
  
  // 找到 CSV 標題行
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('ChallengeName')) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) {
    throw new Error(`無法找到 CSV 標題行：${fileName}`);
  }
  
  // 解析資料行
  const dataLines = lines.slice(headerIndex + 1);
  const records: AimTrainerRecordData[] = [];
  
  for (const line of dataLines) {
    if (!line || line.trim() === '') continue;
    
    try {
      const parts = line.split(',').map(part => part.trim());
      
      if (parts.length < 9) continue;
      
      // 處理準確度字段
      let accuracy = parts[4];
      if (accuracy.includes('%')) {
        accuracy = accuracy.replace('%', '');
      }
      
      // 檢查是否是有效的百分比
      if (accuracy.includes('na') || accuracy.includes('nd') || accuracy.includes('-')) {
        accuracy = '0';
      }
      
      const record: AimTrainerRecordData = {
        challengeName: parts[0],
        shotsHit: parseInt(parts[1]) || 0,
        kills: parseInt(parts[2]) || 0,
        weapon: parts[3],
        accuracy: parseFloat(accuracy) || 0,
        damage: parseInt(parts[5]) || 0,
        criticalShots: parseInt(parts[6]) || 0,
        totalShots: parseInt(parts[7]) || 0,
        roundTime: parseInt(parts[8]) || 0
      };
      
      // 驗證記錄是否有效
      if (record.challengeName && record.weapon && record.totalShots > 0) {
        records.push(record);
      }
    } catch (error) {
      console.warn(`解析資料行失敗: ${line}`, error);
    }
  }
  
  return records;
};

// 從檔名提取時間戳
const extractTimestamp = (fileName: string): string => {
  const match = fileName.match(/aimtrainer_results_(\d+)/);
  return match ? match[1] : '0';
};

// POST /api/aimtrainer/upload - 上傳 AimTrainer 檔案
router.post('/upload', authenticateToken, upload.array('files'), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: '請選擇至少一個 AimTrainer 檔案'
      });
    }
    
    const results = {
      totalFiles: files.length,
      processedFiles: 0,
      skippedFiles: 0,
      totalRecords: 0,
      duplicatesRemoved: 0,
      newRecords: 0,
      errors: [] as string[]
    };
    
    // 處理每個檔案
    for (const file of files) {
      try {
        const fileName = file.originalname;
        const fileTimestamp = extractTimestamp(fileName);
        
        // 檢查檔案是否已經被處理過
        const existingRecordCount = await AimTrainerRecord.count({
          where: {
            userId: userId,
            fileTimestamp: fileTimestamp,
            fileName: fileName
          }
        });
        
        if (existingRecordCount > 0) {
          console.log(`檔案 ${fileName} 已經被處理過，跳過`);
          results.skippedFiles++;
          continue;
        }
        
        // 解析檔案內容
        const fileContent = file.buffer.toString('utf8');
        const records = parseAimTrainerFile(fileContent, fileName);
        
        results.totalRecords += records.length;
        
        // 檢查檔案內部的重複記錄
        const uniqueRecords = new Map<string, AimTrainerRecordData>();
        
        for (const record of records) {
          // 生成記錄唯一標識符（不包含檔案時間戳，僅用於檔案內部去重）
          const recordKey = `${record.challengeName}_${record.weapon}_${record.shotsHit}_${record.totalShots}_${record.damage}_${record.criticalShots}_${record.roundTime}`;
          
          if (uniqueRecords.has(recordKey)) {
            results.duplicatesRemoved++;
          } else {
            uniqueRecords.set(recordKey, record);
          }
        }
        
        // 準備插入資料庫的資料
        const recordsToInsert = Array.from(uniqueRecords.values()).map(record => ({
          userId: userId,
          fileTimestamp: fileTimestamp,
          fileName: fileName,
          challengeName: record.challengeName,
          shotsHit: record.shotsHit,
          kills: record.kills,
          weapon: record.weapon,
          accuracy: record.accuracy,
          damage: record.damage,
          criticalShots: record.criticalShots,
          totalShots: record.totalShots,
          roundTime: record.roundTime,
          uploadedAt: new Date()
        }));
        
        // 批量插入資料庫
        await AimTrainerRecord.bulkCreate(recordsToInsert);
        
        results.newRecords += recordsToInsert.length;
        results.processedFiles++;
        
        console.log(`✅ 處理檔案 ${fileName}：${recordsToInsert.length} 筆記錄`);
        
      } catch (error) {
        const errorMessage = `處理檔案 ${file.originalname} 時發生錯誤：${error}`;
        results.errors.push(errorMessage);
        console.error(errorMessage);
      }
    }
    
    res.json({
      success: true,
      message: `處理完成！共處理 ${results.processedFiles} 個檔案，新增 ${results.newRecords} 筆記錄`,
      data: results
    });
    
  } catch (error) {
    console.error('AimTrainer 檔案上傳錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器處理錯誤',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : '請稍後再試'
    });
  }
});

// GET /api/aimtrainer/records - 取得 AimTrainer 記錄
router.get('/records', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const weapon = req.query.weapon as string;
    const challengeName = req.query.challengeName as string;
    
    // 構建查詢條件
    const whereConditions: any = {
      userId: userId
    };
    
    if (weapon) {
      whereConditions.weapon = weapon;
    }
    
    if (challengeName) {
      whereConditions.challengeName = challengeName;
    }
    
    const records = await AimTrainerRecord.findAll({
      where: whereConditions,
      order: [['uploadedAt', 'DESC'], ['id', 'DESC']],
      limit: Math.min(limit, 1000),
      offset: offset
    });
    
    const total = await AimTrainerRecord.count({
      where: whereConditions
    });
    
    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total
      }
    });
    
  } catch (error) {
    console.error('取得 AimTrainer 記錄錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器處理錯誤'
    });
  }
});

// GET /api/aimtrainer/statistics - 取得統計資料
router.get('/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // 基本統計
    const totalRecords = await AimTrainerRecord.count({
      where: { userId: userId }
    });
    
    if (totalRecords === 0) {
      return res.json({
        success: true,
        data: {
          totalRecords: 0,
          totalShots: 0,
          totalHits: 0,
          totalDamage: 0,
          totalCrits: 0,
          avgAccuracy: 0,
          weapons: [],
          challenges: [],
          recentUploads: []
        }
      });
    }
    
    // 聚合統計
    const [aggregateResult] = await AimTrainerRecord.findAll({
      where: { userId: userId },
      attributes: [
        [AimTrainerRecord.sequelize!.fn('SUM', AimTrainerRecord.sequelize!.col('totalShots')), 'totalShots'],
        [AimTrainerRecord.sequelize!.fn('SUM', AimTrainerRecord.sequelize!.col('shotsHit')), 'totalHits'],
        [AimTrainerRecord.sequelize!.fn('SUM', AimTrainerRecord.sequelize!.col('damage')), 'totalDamage'],
        [AimTrainerRecord.sequelize!.fn('SUM', AimTrainerRecord.sequelize!.col('criticalShots')), 'totalCrits'],
        [AimTrainerRecord.sequelize!.fn('AVG', AimTrainerRecord.sequelize!.col('accuracy')), 'avgAccuracy']
      ],
      raw: true
    });
    
    // 武器統計
    const weaponStats = await AimTrainerRecord.findAll({
      where: { userId: userId },
      attributes: [
        'weapon',
        [AimTrainerRecord.sequelize!.fn('COUNT', AimTrainerRecord.sequelize!.col('id')), 'count'],
        [AimTrainerRecord.sequelize!.fn('AVG', AimTrainerRecord.sequelize!.col('accuracy')), 'avgAccuracy']
      ],
      group: ['weapon'],
      order: [[AimTrainerRecord.sequelize!.fn('COUNT', AimTrainerRecord.sequelize!.col('id')), 'DESC']],
      raw: true
    });
    
    // 挑戰統計
    const challengeStats = await AimTrainerRecord.findAll({
      where: { userId: userId },
      attributes: [
        'challengeName',
        [AimTrainerRecord.sequelize!.fn('COUNT', AimTrainerRecord.sequelize!.col('id')), 'count'],
        [AimTrainerRecord.sequelize!.fn('AVG', AimTrainerRecord.sequelize!.col('accuracy')), 'avgAccuracy']
      ],
      group: ['challengeName'],
      order: [[AimTrainerRecord.sequelize!.fn('COUNT', AimTrainerRecord.sequelize!.col('id')), 'DESC']],
      raw: true
    });
    
    // 最近上傳的檔案
    const recentUploads = await AimTrainerRecord.findAll({
      where: { userId: userId },
      attributes: [
        'fileName',
        'fileTimestamp',
        'uploadedAt',
        [AimTrainerRecord.sequelize!.fn('COUNT', AimTrainerRecord.sequelize!.col('id')), 'recordCount']
      ],
      group: ['fileName', 'fileTimestamp', 'uploadedAt'],
      order: [['uploadedAt', 'DESC']],
      limit: 10,
      raw: true
    });
    
    res.json({
      success: true,
      data: {
        totalRecords,
        totalShots: parseInt((aggregateResult as any).totalShots as string) || 0,
        totalHits: parseInt((aggregateResult as any).totalHits as string) || 0,
        totalDamage: parseInt((aggregateResult as any).totalDamage as string) || 0,
        totalCrits: parseInt((aggregateResult as any).totalCrits as string) || 0,
        avgAccuracy: parseFloat((aggregateResult as any).avgAccuracy as string) || 0,
        weapons: weaponStats,
        challenges: challengeStats,
        recentUploads: recentUploads
      }
    });
    
  } catch (error) {
    console.error('取得統計資料錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器處理錯誤'
    });
  }
});

// DELETE /api/aimtrainer/records/:id - 刪除特定記錄
router.delete('/records/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const recordId = parseInt(req.params.id);
    
    const result = await AimTrainerRecord.destroy({
      where: {
        id: recordId,
        userId: userId
      }
    });
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        error: '找不到指定的記錄'
      });
    }
    
    res.json({
      success: true,
      message: '記錄已刪除'
    });
    
  } catch (error) {
    console.error('刪除記錄錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器處理錯誤'
    });
  }
});

export default router; 