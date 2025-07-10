import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// DataRecord 模型屬性介面
interface DataRecordAttributes {
  id?: number;
  datasetId: number;
  dataJson: string;
  rowHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// DataRecord 模型類別
class DataRecord extends Model<DataRecordAttributes> implements DataRecordAttributes {
  public id!: number;
  public datasetId!: number;
  public dataJson!: string;
  public rowHash!: string;
  
  // 時間戳記
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// DataRecord 模型定義
DataRecord.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '資料記錄的唯一識別碼'
  },
  datasetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '所屬資料集 ID'
  },
  dataJson: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '單筆資料 (JSON 格式)'
  },
  rowHash: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: '資料的雜湊值，用於重複檢查'
  }
}, {
  sequelize,
  tableName: 'data_records',
  indexes: [
    {
      fields: ['dataset_id']
    },
    {
      fields: ['row_hash']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['dataset_id', 'row_hash'],
      unique: true
    }
  ]
});

export default DataRecord; 