import { Sequelize } from 'sequelize';

// 資料庫設定
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/uploads.db',  // 資料庫檔案位置
  logging: console.log,          // 開發時顯示 SQL (相當於 .NET 的 EF Core logging)
  define: {
    timestamps: true,            // 自動加入 createdAt, updatedAt
    underscored: true,           // 使用 snake_case 欄位名稱
  }
});

export default sequelize; 