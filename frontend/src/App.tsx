import React, { useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import { CSVUploader, FieldSelector, ChartDisplay, DataTable, AdminLayout, ChartAnalysis } from './components';
import { ProtectedRoute, AuthProvider, useAuth } from './features/auth';
import { CHART_TYPES, API_ENDPOINTS } from './shared/constants';
import { ChartType, DataRow, DatasetsListResponse, DatasetDetailResponse } from './shared/types';
import { apiRequest } from './features/auth';
import zhTW from 'antd/locale/zh_TW';
import './App.css';

const AppContent: React.FC = () => {
  // 主要狀態管理
  const [csvData, setCsvData] = useState<DataRow[] | null>(null); // CSV 解析後的資料
  const [columns, setColumns] = useState<string[]>([]); // 欄位名稱陣列
  const [selectedXAxis, setSelectedXAxis] = useState<string>(''); // 選擇的 X 軸欄位
  const [selectedYAxis, setSelectedYAxis] = useState<string[]>([]); // 選擇的 Y 軸欄位陣列
  const [chartType, setChartType] = useState<ChartType>(CHART_TYPES.LINE); // 圖表類型
  const [currentPage, setCurrentPage] = useState<string>('dashboard'); // 目前頁面
  const [currentUploadId, setCurrentUploadId] = useState<number | null>(null); // 當前載入的上傳記錄 ID
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false); // 載入資料狀態

  // 取得認證上下文
  const { user, isAuthenticated } = useAuth();

  // 載入使用者最近的資料集資料
  const loadUserLatestData = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingData(true);
    try {
      // 獲取使用者的資料集列表
      const datasetsResponse = await apiRequest(API_ENDPOINTS.DATASETS.LIST, {
        method: 'GET'
      });

      if (!datasetsResponse.ok) {
        throw new Error('無法載入資料集列表');
      }

      const datasetsData: DatasetsListResponse = await datasetsResponse.json();
      
      if (datasetsData.success && datasetsData.data && datasetsData.data.length > 0) {
        // 取得最近的資料集
        const latestDataset = datasetsData.data[0];
        
        // 載入該資料集的詳細資料
        const detailResponse = await apiRequest(API_ENDPOINTS.DATASETS.DETAIL.replace(':id', latestDataset.id.toString()), {
          method: 'GET'
        });

        if (!detailResponse.ok) {
          throw new Error('無法載入資料集詳情');
        }

        const detailData: DatasetDetailResponse = await detailResponse.json();
        
        if (detailData.success && detailData.data) {
          // 將 DataRecord 轉換為 DataRow 格式
          const rows = detailData.data.records.map(record => JSON.parse(record.dataJson));
          
          // 添加調試日誌
          console.log('🔍 從後端獲取的資料：');
          console.log('資料集資訊:', detailData.data.dataset);
          console.log('記錄數量:', detailData.data.records.length);
          console.log('解析後的資料行數:', rows.length);
          console.log('欄位:', detailData.data.columns);
          console.log('前3筆資料:', rows.slice(0, 3));
          
          // 載入資料到狀態
          setCsvData(rows);
          setColumns(detailData.data.columns);
          setCurrentUploadId(detailData.data.dataset.id);
          console.log(`✅ 已載入使用者最近的資料集: ${detailData.data.dataset.name}`);
        }
      } else {
        // 沒有歷史資料，清空狀態
        setCsvData(null);
        setColumns([]);
        setCurrentUploadId(null);
        console.log('ℹ️ 使用者尚未創建任何資料集');
      }
    } catch (error) {
      console.error('載入使用者資料失敗:', error);
      // 載入失敗時清空狀態
      setCsvData(null);
      setColumns([]);
      setCurrentUploadId(null);
    } finally {
      setIsLoadingData(false);
    }
  };

  // 監聽使用者登入狀態，自動載入資料
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserLatestData();
    }
  }, [isAuthenticated, user]);

  // 處理 CSV 上傳成功
  const handleCSVUpload = (data: DataRow[], columnsData: string[]): void => {
    setCsvData(data);
    setColumns(columnsData);
    setCurrentUploadId(null); // 新上傳的資料還沒有 ID
    // 重置選擇的欄位
    setSelectedXAxis('');
    setSelectedYAxis([]);
    
    // 重新載入使用者最近的資料以顯示完整的資料集
    setTimeout(() => {
      loadUserLatestData();
    }, 500); // 給後端一點時間處理完成
  };

  // 處理 X 軸欄位選擇
  const handleXAxisChange = (fieldName: string): void => {
    setSelectedXAxis(fieldName);
  };

  // 處理 Y 軸欄位選擇
  const handleYAxisChange = (fieldNames: string[]): void => {
    setSelectedYAxis(fieldNames);
  };

  // 切換圖表類型
  const toggleChartType = (): void => {
    setChartType(prev => 
      prev === CHART_TYPES.LINE ? CHART_TYPES.BAR : CHART_TYPES.LINE
    );
  };

  // 處理選單選擇
  const handleMenuSelect = (key: string): void => {
    setCurrentPage(key);
  };

  // 渲染頁面內容
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <h2>儀表板</h2>
            <p>歡迎使用 CSV 管理系統！</p>
            {isLoadingData && <p>載入資料中...</p>}
            {csvData && (
              <div className="dashboard-stats">
                <div className="stat-card">
                  <h3>目前載入資料</h3>
                  <p>共 {csvData.length} 筆資料</p>
                </div>
                <div className="stat-card">
                  <h3>欄位數量</h3>
                  <p>{columns.length} 個欄位</p>
                </div>
                {currentUploadId && (
                  <div className="stat-card">
                    <h3>載入來源</h3>
                    <p>資料集 #{currentUploadId}</p>
                  </div>
                )}
              </div>
            )}
            {!csvData && !isLoadingData && (
              <div className="no-data-message">
                <p>尚未載入任何資料，請前往「CSV 上傳」頁面上傳檔案</p>
              </div>
            )}
          </div>
        );
      
      case 'csv-upload':
        return (
          <div className="csv-upload-content">
            <h2>CSV 上傳</h2>
            <CSVUploader onUpload={handleCSVUpload} />
          </div>
        );
      
      case 'data-table':
        return <DataTable />;
      
      case 'charts':
        return <ChartAnalysis />;
      
      case 'settings':
        return (
          <div className="settings-content">
            <h2>系統設定</h2>
            <p>系統設定功能開發中...</p>
          </div>
        );
      
      default:
        return <div>頁面未找到</div>;
    }
  };

  return (
    <AdminLayout 
      currentPage={currentPage}
      onMenuSelect={handleMenuSelect}
    >
      {renderPageContent()}
    </AdminLayout>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
      <AuthProvider>
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App; 