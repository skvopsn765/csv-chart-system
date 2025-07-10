import React, { useState } from 'react';
import Papa from 'papaparse';
import { message } from 'antd';
import { CSVUploaderProps, DataRow, ColumnsCheckResponse, DatasetCreateResponse, DuplicateCheckResult, DuplicateCheckResponse } from '../../../shared/types';
import { FILE_UPLOAD_LIMITS, API_ENDPOINTS } from '../../../shared/constants';
import { apiRequest } from '../../../features/auth';
import { DuplicateConfirmation } from '../DuplicateConfirmation';
import { DatasetSelectorModal } from '../DatasetSelectorModal';
import './index.css';

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onUpload }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // CSV 解析相關狀態
  const [csvData, setCsvData] = useState<{
    columns: string[];
    rows: DataRow[];
    fileName: string;
  } | null>(null);
  
  // 資料集選擇相關狀態
  const [showDatasetSelector, setShowDatasetSelector] = useState<boolean>(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  
  // 重複檢查相關狀態
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [showDuplicateConfirmation, setShowDuplicateConfirmation] = useState<boolean>(false);

  // 顯示成功訊息
  const showSuccessMessage = (count: number) => {
    message.success({
      content: `成功上傳 ${count} 筆資料！`,
      duration: 3,
      style: {
        marginTop: '20px',
        fontSize: '16px',
      }
    });
  };

  // 重置所有狀態
  const resetAllStates = () => {
    setError('');
    setUploadProgress(0);
    setCsvData(null);
    setShowDatasetSelector(false);
    setSelectedDatasetId(null);
    setDuplicateResult(null);
    setShowDuplicateConfirmation(false);
  };

  // 完全重新開始上傳流程
  const handleRestart = () => {
    console.log('🔄 用戶選擇重新開始');
    resetAllStates();
    
    // 重置檔案輸入
    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // 重新開啟資料集選擇器
  const handleReopenDatasetSelector = () => {
    console.log('🔄 重新開啟資料集選擇器');
    setError('');
    setShowDatasetSelector(true);
  };

  // 驗證檔案格式
  const validateFile = (file: File): string | null => {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = FILE_UPLOAD_LIMITS.ALLOWED_EXTENSIONS.some(ext => 
      fileName.endsWith(ext)
    );
    
    if (!hasValidExtension) {
      return `請選擇 CSV 檔案（${FILE_UPLOAD_LIMITS.ALLOWED_EXTENSIONS.join(', ')} 副檔名）`;
    }

    if (file.size > FILE_UPLOAD_LIMITS.MAX_FILE_SIZE) {
      return `檔案大小超過限制（最大 ${(FILE_UPLOAD_LIMITS.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB）`;
    }

    const allowedMimeTypes = FILE_UPLOAD_LIMITS.ALLOWED_MIME_TYPES as readonly string[];
    if (file.type !== '' && !allowedMimeTypes.includes(file.type)) {
      return '檔案格式不正確';
    }

    return null;
  };

  // 解析 CSV 檔案
  const parseCSVFile = (file: File): Promise<{ columns: string[], rows: DataRow[] }> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV 解析錯誤: ${results.errors.map(err => err.message).join(', ')}`));
            return;
          }
          
          const data = results.data as DataRow[];
          if (data.length === 0) {
            reject(new Error('CSV 檔案中沒有有效資料'));
            return;
          }
          
          const columns = Object.keys(data[0]);
          if (columns.length === 0) {
            reject(new Error('CSV 檔案中沒有有效欄位'));
            return;
          }
          
          resolve({ columns, rows: data });
        },
        error: (error) => {
          reject(new Error(`CSV 解析失敗: ${error.message}`));
        }
      });
    });
  };

  // 檢查欄位結構
  const checkColumnsStructure = async (columns: string[]): Promise<ColumnsCheckResponse> => {
    const response = await apiRequest(API_ENDPOINTS.DATASETS.CHECK_COLUMNS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ columns })
    });

    const result: ColumnsCheckResponse = await response.json();
    if (!response.ok) {
      throw new Error(result.error || '檢查欄位結構失敗');
    }
    return result;
  };

  // 創建新資料集
  const createDataset = async (name: string, description: string | undefined, columns: string[]): Promise<DatasetCreateResponse> => {
    const response = await apiRequest(API_ENDPOINTS.DATASETS.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description, columns })
    });

    const result: DatasetCreateResponse = await response.json();
    if (!response.ok) {
      throw new Error(result.error || '創建資料集失敗');
    }
    return result;
  };

  // 檢查重複資料
  const checkDuplicateData = async (datasetId: number, columns: string[], rows: DataRow[]): Promise<DuplicateCheckResult> => {
    const response = await apiRequest(API_ENDPOINTS.DATASETS.CHECK_DUPLICATES.replace(':id', datasetId.toString()), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ columns, rows })
    });

    const result: DuplicateCheckResponse = await response.json();
    if (!response.ok) {
      throw new Error(result.error || '檢查重複資料失敗');
    }
    return result.data!;
  };

  // 部分上傳資料
  const partialUploadData = async (datasetId: number, columns: string[], rows: DataRow[]): Promise<void> => {
    const response = await apiRequest(API_ENDPOINTS.DATASETS.PARTIAL_UPLOAD.replace(':id', datasetId.toString()), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ columns, rows })
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || '上傳資料失敗');
    }
  };

  // 處理檔案選擇
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    
    console.log('🔍 handleFileChange 被調用');
    console.log('選擇的檔案:', file?.name || '沒有檔案');
    
    if (!file) {
      console.log('⚠️ 沒有選擇檔案，返回');
      return;
    }

    // 重置狀態
    console.log('🔄 重置所有狀態');
    resetAllStates();

    // 驗證檔案
    const validationError = validateFile(file);
    if (validationError) {
      console.log('❌ 檔案驗證失敗:', validationError);
      setError(validationError);
      return;
    }

    console.log('✅ 檔案驗證通過，開始處理');
    setIsUploading(true);
    setUploadProgress(25);

    try {
      // 解析 CSV 檔案
      console.log('📄 開始解析 CSV 檔案');
      const { columns, rows } = await parseCSVFile(file);
      console.log(`📊 CSV 解析完成: ${rows.length} 筆資料, ${columns.length} 個欄位`);
      setUploadProgress(50);

      // 檢查欄位結構
      console.log('🔍 檢查欄位結構');
      const checkResult = await checkColumnsStructure(columns);
      console.log('🔍 欄位結構檢查結果:', checkResult);
      setUploadProgress(75);

      // 設置 CSV 資料
      setCsvData({
        columns,
        rows,
        fileName: file.name
      });

      console.log('💾 CSV 資料已設置，準備顯示資料集選擇器');
      
      if (checkResult.data?.hasMatching) {
        console.log('✅ 找到匹配的資料集，顯示選擇器');
        setShowDatasetSelector(true);
      } else {
        console.log('🆕 沒有匹配的資料集，顯示創建新資料集選項');
        setShowDatasetSelector(true);
      }

      setUploadProgress(100);
      console.log('✅ 檔案處理完成');
    } catch (error) {
      console.error('❌ 檔案處理錯誤:', error);
      setError(error instanceof Error ? error.message : '檔案處理失敗');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      console.log('🏁 handleFileChange 處理結束');
    }
  };

  // 處理資料集選擇
  const handleDatasetSelect = async (datasetId: number) => {
    if (!csvData) return;

    setShowDatasetSelector(false);
    setSelectedDatasetId(datasetId);
    setIsUploading(true);
    setUploadProgress(25);

    try {
      // 檢查重複資料
      const duplicateResult = await checkDuplicateData(datasetId, csvData.columns, csvData.rows);
      setUploadProgress(50);

      if (duplicateResult.hasDuplicates) {
        // 如果有重複資料，顯示確認對話框
        setDuplicateResult(duplicateResult);
        setShowDuplicateConfirmation(true);
      } else {
        // 如果沒有重複資料，直接上傳
        await partialUploadData(datasetId, csvData.columns, csvData.rows);
        setUploadProgress(100);
        onUpload(csvData.rows, csvData.columns);
        showSuccessMessage(csvData.rows.length);
      }
    } catch (error) {
      console.error('資料集處理錯誤:', error);
      setError(error instanceof Error ? error.message : '資料集處理失敗');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 處理創建新資料集
  const handleCreateDataset = async (name: string, description?: string) => {
    if (!csvData) return;

    setShowDatasetSelector(false);
    setIsUploading(true);
    setUploadProgress(25);

    try {
      // 創建新資料集
      const createResult = await createDataset(name, description, csvData.columns);
      setUploadProgress(50);

      if (createResult.data) {
        const datasetId = createResult.data.id;
        setSelectedDatasetId(datasetId);

        // 新創建的資料集不會有重複資料，直接上傳
        await partialUploadData(datasetId, csvData.columns, csvData.rows);
        setUploadProgress(100);
        onUpload(csvData.rows, csvData.columns);
        showSuccessMessage(csvData.rows.length);
      }
    } catch (error) {
      console.error('創建資料集錯誤:', error);
      setError(error instanceof Error ? error.message : '創建資料集失敗');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 處理重複確認 - 部分上傳
  const handleDuplicateConfirm = async (selectedRows: DataRow[]) => {
    if (!csvData || !selectedDatasetId) return;

    setShowDuplicateConfirmation(false);
    setIsUploading(true);
    setUploadProgress(25);

    try {
      if (selectedRows.length === 0) {
        setError('請至少選擇一筆資料進行上傳');
        return;
      }

      // 上傳選中的資料
      await partialUploadData(selectedDatasetId, csvData.columns, selectedRows);
      setUploadProgress(100);
      onUpload(selectedRows, csvData.columns);
      showSuccessMessage(selectedRows.length);
    } catch (error) {
      console.error('部分上傳錯誤:', error);
      setError(error instanceof Error ? error.message : '部分上傳失敗');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 處理重複確認 - 取消上傳
  const handleDuplicateCancel = () => {
    setShowDuplicateConfirmation(false);
    setDuplicateResult(null);
    // 重複確認取消後，可以讓用戶重新選擇資料集
    setShowDatasetSelector(true);
  };

  // 處理資料集選擇取消
  const handleDatasetCancel = () => {
    setShowDatasetSelector(false);
    // 不要清空csvData，因為用戶可能想重新選擇資料集而不是重新上傳檔案
    // setCsvData(null); // 移除此行
    setSelectedDatasetId(null);
    setDuplicateResult(null);
    
    // 重置檔案輸入，允許重新選擇同一檔案
    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="csv-uploader">
      <div className="uploader-content">
        <h3>匯入 CSV 檔案</h3>
        <p className="uploader-description">
          請選擇一個 CSV 檔案來開始分析資料
        </p>
        
        <div className="file-input-container">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isUploading}
            className="file-input"
            id="csv-file-input"
          />
          <label htmlFor="csv-file-input" className="file-input-label">
            {isUploading ? '處理中...' : '選擇 CSV 檔案'}
          </label>
        </div>

        {/* CSV 已解析但對話框關閉時的狀態 */}
        {csvData && !showDatasetSelector && !showDuplicateConfirmation && !isUploading && (
          <div className="csv-parsed-status">
            <div className="parsed-info">
              <h4>✅ 已解析 CSV 檔案：{csvData.fileName}</h4>
              <p>共 {csvData.rows.length} 筆資料，{csvData.columns.length} 個欄位</p>
              <p className="columns-preview">
                欄位：{csvData.columns.slice(0, 3).join(', ')}
                {csvData.columns.length > 3 && ` 等 ${csvData.columns.length} 個欄位`}
              </p>
            </div>
            <div className="action-buttons">
              <button 
                onClick={handleReopenDatasetSelector}
                className="action-button primary"
              >
                繼續選擇資料集
              </button>
              <button 
                onClick={handleRestart}
                className="action-button secondary"
              >
                重新選擇檔案
              </button>
            </div>
          </div>
        )}

        {/* 上傳進度條 */}
        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}

        {/* 錯誤訊息顯示 */}
        {error && (
          <div className="error-message">
            <strong>錯誤：</strong>{error}
          </div>
        )}

        {/* 成功提示 */}
        {/* 成功提示 */}

        {/* 檔案格式說明 */}
        <div className="file-info">
          <h4>檔案格式要求：</h4>
          <ul>
            <li>檔案格式：{FILE_UPLOAD_LIMITS.ALLOWED_EXTENSIONS.join(', ')}</li>
            <li>檔案大小：最大 {(FILE_UPLOAD_LIMITS.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB</li>
            <li>資料筆數：最大 {FILE_UPLOAD_LIMITS.MAX_ROWS.toLocaleString()} 筆</li>
            <li>第一行：必須為欄位名稱</li>
            <li>編碼：UTF-8</li>
            <li><strong>智慧資料集：</strong>系統會自動檢查欄位結構並分類資料</li>
          </ul>
        </div>

        {/* 認證狀態 */}
        <div className="server-status">
          <small>
            🔒 已通過身份驗證
          </small>
        </div>
      </div>

      {/* 資料集選擇對話框 */}
      <DatasetSelectorModal
        visible={showDatasetSelector}
        columns={csvData?.columns || []}
        onSelect={handleDatasetSelect}
        onCancel={handleDatasetCancel}
        onCreateNew={handleCreateDataset}
        loading={isUploading}
      />

      {/* 重複確認對話框 */}
      <DuplicateConfirmation
        visible={showDuplicateConfirmation}
        duplicateResult={duplicateResult}
        columns={csvData?.columns || []}
        fileName={csvData?.fileName || ''}
        onConfirm={handleDuplicateConfirm}
        onCancel={handleDuplicateCancel}
        loading={isUploading}
      />
    </div>
  );
}; 