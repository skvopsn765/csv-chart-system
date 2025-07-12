import { Sequelize } from 'sequelize';

// 環境變數配置
const isDevelopment = process.env.NODE_ENV !== 'production';
const databaseUrl = process.env.DATABASE_URL;

// 資料庫設定
const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      retry: {
        max: 3
      },
      logging: isDevelopment ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
      }
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './data/uploads.db',
      logging: isDevelopment ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
      }
    });

export default sequelize; 