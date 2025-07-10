import sequelize from '../config/database';
import { QueryInterface, DataTypes } from 'sequelize';

/**
 * 遷移腳本：為 uploads 表新增 userId 欄位
 * 
 * 使用方式：
 * 1. 在終端機中執行：cd backend && npm run migrate
 * 2. 或者直接執行：npx ts-node src/migrations/add-user-id-to-uploads.ts
 */

export async function up() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('開始遷移：新增 userId 欄位到 uploads 表...');
    
    // 檢查欄位是否已存在
    const tableDescription = await queryInterface.describeTable('uploads');
    
    if (tableDescription.user_id) {
      console.log('✅ userId 欄位已存在，跳過遷移');
      return;
    }
    
    // 新增 userId 欄位
    await queryInterface.addColumn('uploads', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: true, // 暫時允許為空，稍後會更新現有記錄
      comment: '上傳者用戶 ID'
    });
    
    console.log('✅ 已新增 userId 欄位');
    
    // 為現有記錄設置默認 userId (假設使用 userId = 1)
    await queryInterface.sequelize.query(`
      UPDATE uploads 
      SET user_id = 1 
      WHERE user_id IS NULL
    `);
    
    console.log('✅ 已更新現有記錄的 userId');
    
    // 修改欄位為不允許 NULL
    await queryInterface.changeColumn('uploads', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '上傳者用戶 ID'
    });
    
    console.log('✅ 已修改 userId 欄位為必填');
    
    // 新增索引
    await queryInterface.addIndex('uploads', ['user_id'], {
      name: 'idx_uploads_user_id'
    });
    
    console.log('✅ 已新增 userId 索引');
    
    console.log('🎉 遷移完成！');
    
  } catch (error) {
    console.error('❌ 遷移失敗:', error);
    throw error;
  }
}

export async function down() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('開始回滾：移除 userId 欄位...');
    
    // 移除索引
    await queryInterface.removeIndex('uploads', 'idx_uploads_user_id');
    console.log('✅ 已移除 userId 索引');
    
    // 移除欄位
    await queryInterface.removeColumn('uploads', 'user_id');
    console.log('✅ 已移除 userId 欄位');
    
    console.log('🎉 回滾完成！');
    
  } catch (error) {
    console.error('❌ 回滾失敗:', error);
    throw error;
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('資料庫連接成功');
      
      await up();
      
      await sequelize.close();
      console.log('資料庫連接已關閉');
      
    } catch (error) {
      console.error('執行遷移時發生錯誤:', error);
      process.exit(1);
    }
  })();
} 