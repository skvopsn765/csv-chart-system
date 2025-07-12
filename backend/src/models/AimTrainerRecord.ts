import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// AimTrainerRecord 模型屬性介面
interface AimTrainerRecordAttributes {
  id?: number;
  userId: number;
  fileTimestamp: string; // 從檔名提取的時間戳
  fileName: string; // 原始檔名
  challengeName: string;
  shotsHit: number;
  kills: number;
  weapon: string;
  accuracy: number; // 儲存為數字，方便統計
  damage: number;
  criticalShots: number;
  totalShots: number;
  roundTime: number;
  uploadedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// AimTrainerRecord 模型類別
class AimTrainerRecord extends Model<AimTrainerRecordAttributes> implements AimTrainerRecordAttributes {
  public id!: number;
  public userId!: number;
  public fileTimestamp!: string;
  public fileName!: string;
  public challengeName!: string;
  public shotsHit!: number;
  public kills!: number;
  public weapon!: string;
  public accuracy!: number;
  public damage!: number;
  public criticalShots!: number;
  public totalShots!: number;
  public roundTime!: number;
  public uploadedAt!: Date;
  
  // 時間戳記
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// AimTrainerRecord 模型定義
AimTrainerRecord.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'AimTrainer 記錄的唯一識別碼'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用戶 ID'
  },
  fileTimestamp: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '檔案時間戳（從檔名提取）'
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '原始檔名'
  },
  challengeName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '挑戰名稱'
  },
  shotsHit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '命中次數'
  },
  kills: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '擊殺數'
  },
  weapon: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '武器名稱'
  },
  accuracy: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    comment: '準確度（百分比數字）'
  },
  damage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '傷害量'
  },
  criticalShots: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '爆頭次數'
  },
  totalShots: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '總射擊次數'
  },
  roundTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '回合時間（秒）'
  },
  uploadedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '上傳時間'
  }
}, {
  sequelize,
  tableName: 'aimtrainer_records',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['file_timestamp']
    },
    {
      fields: ['challenge_name']
    },
    {
      fields: ['weapon']
    },
    {
      fields: ['uploaded_at']
    },
    {
      // 組合索引用於去重檢查
      fields: ['user_id', 'file_timestamp', 'challenge_name', 'weapon', 'shots_hit', 'total_shots', 'damage', 'critical_shots', 'round_time'],
      name: 'idx_aimtrainer_duplicate_check'
    }
  ]
});

export default AimTrainerRecord; 