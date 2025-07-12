import React, { useState } from 'react';
import { Typography, Space, message, Divider, Tabs } from 'antd';
import { AimOutlined, BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import AimTrainerUploader from '../../components/aimtrainer/AimTrainerUploader';
import AimTrainerStats from '../../components/aimtrainer/AimTrainerStats';
import { GenericChartAnalysis } from '../../components/charts';
import { AimTrainerUploadResult, AimTrainerRecord } from '../../shared/types/aimtrainer';
import { GenericChartDataSource } from '../../shared/types/chart';
import { DataRow } from '../../shared/types';
import { API_ENDPOINTS } from '../../shared/constants';
import { apiRequest } from '../../features/auth';
import './index.css';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

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

  // 創建 AimTrainer 資料來源適配器
  const aimTrainerDataSource: GenericChartDataSource = {
    title: 'AimTrainer 資料分析',
    columns: [
      'id',
      'challengeName',
      'weapon',
      'shotsHit',
      'kills',
      'accuracy',
      'damage',
      'criticalShots',
      'totalShots',
      'roundTime',
      'fileTimestamp',
      'fileName'
    ],
        fetchData: async (limit = 100): Promise<DataRow[]> => {
      const url = new URL(API_ENDPOINTS.AIMTRAINER.RECORDS, window.location.origin);
      url.searchParams.append('limit', limit.toString());
      
      const response = await apiRequest(url.pathname + url.search, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('無法載入 AimTrainer 記錄');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // 將 AimTrainerRecord 轉換為 DataRow 格式
        return result.data.map((record: AimTrainerRecord) => ({
          id: record.id,
          challengeName: record.challengeName,
          weapon: record.weapon,
          shotsHit: record.shotsHit,
          kills: record.kills,
          accuracy: record.accuracy,
          damage: record.damage,
          criticalShots: record.criticalShots,
          totalShots: record.totalShots,
          roundTime: record.roundTime,
          fileTimestamp: record.fileTimestamp,
          fileName: record.fileName,
          uploadedAt: record.uploadedAt
        }));
      }
      
      return [];
    }
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
        <Tabs defaultActiveKey="upload" type="card">
          {/* 資料上傳 Tab */}
          <TabPane
            tab={
              <span>
                <AimOutlined />
                資料上傳
              </span>
            }
            key="upload"
          >
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
          </TabPane>

          {/* 圖表分析 Tab */}
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                圖表分析
              </span>
            }
            key="chart"
          >
            <GenericChartAnalysis
              dataSource={aimTrainerDataSource}
              showDataSourceInfo={true}
              className="aimtrainer-chart-analysis"
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AimTrainerPage;
