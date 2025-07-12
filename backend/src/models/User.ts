import { DataTypes, Model } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import sequelize from '../config/database';

// 用戶模型屬性介面
interface UserAttributes {
  id?: number;
  username: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 用戶模型類別
class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  
  // 時間戳記
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 密碼比較方法
  public async comparePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  // 密碼加密（靜態方法）
  public static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
}

// 用戶模型定義
User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '用戶的唯一識別碼'
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '用戶名（唯一）'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '加密後的密碼'
  }
}, {
  sequelize,
  tableName: 'users',
  hooks: {
    // 在保存前自動加密密碼
    beforeCreate: async (user: User) => {
      if (user.password) {
        user.password = await User.hashPassword(user.password);
      }
    },
    beforeUpdate: async (user: User) => {
      if (user.changed('password')) {
        user.password = await User.hashPassword(user.password);
      }
    }
  },
  indexes: [
    {
      fields: ['username']
    }
  ]
});

export default User; 