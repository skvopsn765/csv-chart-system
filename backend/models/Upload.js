const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Upload 模型定義 (相當於 .NET 的 Entity)
const Upload = sequelize.define('Upload', {
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
  }
}, {
  tableName: 'uploads',
  indexes: [
    {
      fields: ['file_name']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Upload; 