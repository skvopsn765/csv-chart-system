import sequelize from '../config/database';
import { QueryInterface, DataTypes } from 'sequelize';

/**
 * 遷移腳本：創建 aimtrainer_records 表
 * 
 * 使用方式：
 * 1. 在終端機中執行：npx ts-node src/migrations/create-aimtrainer-table.ts
 */

export async function up() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('開始遷移：創建 aimtrainer_records 表...');
    
    // 檢查表是否已存在
    const tables = await queryInterface.showAllTables();
    if (tables.includes('aimtrainer_records')) {
      console.log('✅ aimtrainer_records 表已存在，跳過遷移');
      return;
    }
    
    // 創建 aimtrainer_records 表
    await queryInterface.createTable('aimtrainer_records', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'AimTrainer 記錄的唯一識別碼'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '用戶 ID'
      },
      file_timestamp: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '檔案時間戳（從檔名提取）'
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '原始檔名'
      },
      challenge_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '挑戰名稱'
      },
      shots_hit: {
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
      critical_shots: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '爆頭次數'
      },
      total_shots: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '總射擊次數'
      },
      round_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '回合時間（秒）'
      },
      uploaded_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '上傳時間'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
    
    console.log('✅ 已創建 aimtrainer_records 表');
    
    // 新增索引
    await queryInterface.addIndex('aimtrainer_records', ['user_id'], {
      name: 'idx_aimtrainer_user_id'
    });
    
    await queryInterface.addIndex('aimtrainer_records', ['file_timestamp'], {
      name: 'idx_aimtrainer_file_timestamp'
    });
    
    await queryInterface.addIndex('aimtrainer_records', ['challenge_name'], {
      name: 'idx_aimtrainer_challenge_name'
    });
    
    await queryInterface.addIndex('aimtrainer_records', ['weapon'], {
      name: 'idx_aimtrainer_weapon'
    });
    
    await queryInterface.addIndex('aimtrainer_records', ['uploaded_at'], {
      name: 'idx_aimtrainer_uploaded_at'
    });
    
    // 組合索引用於去重檢查
    await queryInterface.addIndex('aimtrainer_records', 
      ['user_id', 'file_timestamp', 'challenge_name', 'weapon', 'shots_hit', 'total_shots', 'damage', 'critical_shots', 'round_time'], 
      {
        name: 'idx_aimtrainer_duplicate_check'
      }
    );
    
    console.log('✅ 已新增所有索引');
    
    console.log('🎉 遷移完成！');
    
  } catch (error) {
    console.error('❌ 遷移失敗:', error);
    throw error;
  }
}

// 如果直接執行此文件，則運行遷移
if (require.main === module) {
  up().then(() => {
    console.log('遷移執行完成');
    process.exit(0);
  }).catch((error) => {
    console.error('遷移執行失敗:', error);
    process.exit(1);
  });
}

export default { up }; 