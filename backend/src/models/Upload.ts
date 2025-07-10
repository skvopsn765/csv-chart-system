import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// Upload 模型屬性介面
interface UploadAttributes {
  id?: number;
  fileName: string;
  fileSize: number;
  columnsInfo: string;
  dataJson: string;
  rowCount?: number;
  columnCount?: number;
  userId: number; // 新增上傳者 ID
  createdAt?: Date;
  updatedAt?: Date;
}

// Upload 模型類別
class Upload extends Model<UploadAttributes> implements UploadAttributes {
  public id!: number;
  public fileName!: string;
  public fileSize!: number;
  public columnsInfo!: string;
  public dataJson!: string;
  public rowCount!: number;
  public columnCount!: number;
  public userId!: number; // 新增上傳者 ID
  
  // 時間戳記
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Upload 模型定義 (相當於 .NET 的 Entity)
Upload.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '上傳記錄的唯一識別碼'
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '原始檔案名稱'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '檔案大小 (bytes)'
  },
  columnsInfo: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '欄位資訊 (JSON 格式)'
  },
  dataJson: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '實際資料 (JSON 格式)'
  },
  rowCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '資料筆數'
  },
  columnCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '欄位數量'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '上傳者用戶 ID'
  }
}, {
  sequelize,
  tableName: 'uploads',
  indexes: [
    {
      fields: ['file_name']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id']
    }
  ]
});

export default Upload; 