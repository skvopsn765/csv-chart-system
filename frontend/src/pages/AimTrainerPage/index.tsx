import React, { useState } from 'react';
import { Typography, Space, message, Divider } from 'antd';
import { AimOutlined } from '@ant-design/icons';
import AimTrainerUploader from '../../components/aimtrainer/AimTrainerUploader';
import AimTrainerStats from '../../components/aimtrainer/AimTrainerStats';
import { AimTrainerUploadResult } from '../../shared/types/aimtrainer';
import './index.css';

const { Title, Paragraph } = Typography;

const AimTrainerPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 上傳完成回調
  const handleUploadComplete = (result: AimTrainerUploadResult) => {
    // 觸發統計組件重新載入
    setRefreshTrigger(prev => prev + 1);
    
    // 滾動到統計區域
    setTimeout(() => {
      const statsSection = document.getElementById('stats-section');
      if (statsSection) {
        statsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  // 錯誤處理回調
  const handleError = (error: string) => {
    message.error(error);
  };

  return (
    <div className="aimtrainer-page">
      <div className="page-header">
        <Title level={2}>
          <AimOutlined /> APEX AimTrainer 資料處理器
        </Title>
        <Paragraph>
          上傳您的 APEX R5reloader AimTrainer 結果文件，系統會自動處理並儲存到資料庫中，
          提供完整的訓練統計分析和記錄管理功能。
        </Paragraph>
      </div>

      <div className="page-content">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 使用說明 */}
          <div className="instructions-section">
            <Title level={4}>使用說明</Title>
            <ul>
              <li>選擇一個或多個 <code>aimtrainer_results_*.txt</code> 文件</li>
              <li>系統會自動解析文件內容並儲存到資料庫中</li>
              <li>每個文件只會被處理一次，避免重複上傳</li>
              <li>上傳完成後，即可查看詳細的統計資料和訓練記錄</li>
              <li>支援按武器、挑戰類型篩選記錄，提供完整的資料分析</li>
            </ul>
          </div>

          <Divider />

          {/* 上傳區域 */}
          <div className="upload-section">
            <AimTrainerUploader 
              onUploadComplete={handleUploadComplete}
              onError={handleError}
            />
          </div>

          <Divider />

          {/* 統計區域 */}
          <div id="stats-section" className="stats-section">
            <AimTrainerStats 
              refreshTrigger={refreshTrigger}
            />
          </div>
        </Space>
      </div>
    </div>
  );
};

export default AimTrainerPage; 