import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// Dataset 模型屬性介面
interface DatasetAttributes {
  id?: number;
  name: string;
  columnsInfo: string;
  userId: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Dataset 模型類別
class Dataset extends Model<DatasetAttributes> implements DatasetAttributes {
  public id!: number;
  public name!: string;
  public columnsInfo!: string;
  public userId!: number;
  public description?: string;
  
  // 時間戳記
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Dataset 模型定義
Dataset.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '資料集的唯一識別碼'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '資料集名稱'
  },
  columnsInfo: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '欄位資訊 (JSON 格式)'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '擁有者用戶 ID'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '資料集描述'
  }
}, {
  sequelize,
  tableName: 'datasets',
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default Dataset; 