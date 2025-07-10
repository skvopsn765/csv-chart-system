import React, { useState } from 'react';
import { CSVUploaderProps, CSVParseResponse, DuplicateCheckResult, DuplicateCheckResponse } from '../../../shared/types';
import { FILE_UPLOAD_LIMITS, API_ENDPOINTS } from '../../../shared/constants';
import { apiRequest } from '../../../features/auth';
import { DuplicateConfirmation } from '../DuplicateConfirmation';

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onUpload }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // 重複檢查相關狀態
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [showDuplicateConfirmation, setShowDuplicateConfirmation] = useState<boolean>(false);
  const [pendingFileData, setPendingFileData] = useState<{
    file: File;
    columns: string[];
    rows: any[];
  } | null>(null);

  // 驗證檔案格式
  const validateFile = (file: File): string | null => {
    // 檢查檔案副檔名
    const fileName = file.name.toLowerCase();
    const hasValidExtension = FILE_UPLOAD_LIMITS.ALLOWED_EXTENSIONS.some(ext => 
      fileName.endsWith(ext)
    );
    
    if (!hasValidExtension) {
      return `請選擇 CSV 檔案（${FILE_UPLOAD_LIMITS.ALLOWED_EXTENSIONS.join(', ')} 副檔名）`;
    }

    // 檢查檔案大小
    if (file.size > FILE_UPLOAD_LIMITS.MAX_FILE_SIZE) {
      return `檔案大小超過限制（最大 ${(FILE_UPLOAD_LIMITS.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB）`;
    }

    // 檢查 MIME 類型（允許空字串，某些瀏覽器可能不提供 MIME 類型）
    const allowedMimeTypes = FILE_UPLOAD_LIMITS.ALLOWED_MIME_TYPES as readonly string[];
    if (file.type !== '' && !allowedMimeTypes.includes(file.type)) {
      return '檔案格式不正確';
    }

    return null;
  };

  // 檢查重複資料
  const checkDuplicateData = async (columns: string[], rows: any[]): Promise<DuplicateCheckResult | null> => {
    try {
      const response = await apiRequest(API_ENDPOINTS.CSV.CHECK_DUPLICATES, {
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

      return result.data || null;
    } catch (error) {
      console.error('檢查重複資料錯誤:', error);
      throw error;
    }
  };

  // 上傳檔案到後端
  const uploadFileToBackend = async (file: File, forceUpload: boolean = false): Promise<CSVParseResponse> => {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    if (forceUpload) {
      formData.append('forceUpload', 'true');
    }

    try {
      const response = await apiRequest(API_ENDPOINTS.CSV.UPLOAD, {
        method: 'POST',
        body: formData
        // 不設置 headers，讓 apiRequest 自動處理
      });

      const result: CSVParseResponse = await response.json();

      if (!response.ok) {
        // 如果是重複資料錯誤（HTTP 409），不拋出異常
        if (response.status === 409) {
          return result;
        }
        throw new Error(result.error || result.details || '上傳失敗');
      }

      return result;
    } catch (error) {
      // 網路錯誤處理
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('無法連接到伺服器，請檢查網路連線');
      }
      throw error;
    }
  };

  // 處理檔案選擇
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 重置狀態
    setError('');
    setUploadProgress(0);
    setDuplicateResult(null);
    setShowDuplicateConfirmation(false);
    setPendingFileData(null);

    // 驗證檔案
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // 開始上傳處理
    setIsUploading(true);
    setUploadProgress(25);

    try {
      setUploadProgress(50);
      
      // 先嘗試上傳（不強制）
      const result = await uploadFileToBackend(file, false);
      
      console.log('上傳結果:', result); // 調試日誌
      
      // 檢查是否有重複資料
      if (result.duplicateCheck && result.duplicateCheck.hasDuplicates) {
        console.log('發現重複資料:', result.duplicateCheck); // 調試日誌
        setUploadProgress(0);
        setIsUploading(false);
        
        // 設置重複確認狀態
        setDuplicateResult(result.duplicateCheck);
        setShowDuplicateConfirmation(true);
        setPendingFileData({
          file,
          columns: result.duplicateCheck.duplicateRows.length > 0 ? 
            Object.keys(result.duplicateCheck.duplicateRows[0]) : [],
          rows: result.duplicateCheck.duplicateRows
        });
        
        console.log('設置重複確認狀態:', {
          showDuplicateConfirmation: true,
          duplicateResult: result.duplicateCheck
        }); // 調試日誌
        
        // 清空文件輸入
        event.target.value = '';
        return;
      }
      
      // 如果沒有重複資料，檢查是否成功
      if (!result.success) {
        console.log('上傳失敗但沒有重複資料:', result); // 調試日誌
        throw new Error(result.error || '上傳失敗');
      }
      
      setUploadProgress(75);

      // 檢查後端回傳的資料
      if (!result.success || !result.data) {
        throw new Error('後端回傳資料格式錯誤');
      }

      const { columns, rows } = result.data;
      
      // 驗證回傳的資料
      if (!columns || !Array.isArray(columns) || columns.length === 0) {
        throw new Error('無法取得有效的欄位資訊');
      }

      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        throw new Error('無法取得有效的資料內容');
      }

      setUploadProgress(100);
      
      // 成功解析，回傳資料給父組件
      onUpload(rows, columns);
      
    } catch (error) {
      console.error('檔案上傳錯誤:', error);
      setError(error instanceof Error ? error.message : '檔案上傳失敗');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 處理重複確認 - 繼續上傳
  const handleDuplicateConfirm = async () => {
    if (!pendingFileData) return;

    setShowDuplicateConfirmation(false);
    setIsUploading(true);
    setUploadProgress(25);

    try {
      setUploadProgress(50);
      
      // 強制上傳
      const result = await uploadFileToBackend(pendingFileData.file, true);
      
      setUploadProgress(75);

      // 檢查後端回傳的資料
      if (!result.success || !result.data) {
        throw new Error('後端回傳資料格式錯誤');
      }

      const { columns, rows } = result.data;
      
      // 驗證回傳的資料
      if (!columns || !Array.isArray(columns) || columns.length === 0) {
        throw new Error('無法取得有效的欄位資訊');
      }

      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        throw new Error('無法取得有效的資料內容');
      }

      setUploadProgress(100);
      
      // 成功解析，回傳資料給父組件
      onUpload(rows, columns);
      
    } catch (error) {
      console.error('檔案上傳錯誤:', error);
      setError(error instanceof Error ? error.message : '檔案上傳失敗');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setPendingFileData(null);
      setDuplicateResult(null);
    }
  };

  // 處理重複確認 - 取消上傳
  const handleDuplicateCancel = () => {
    setShowDuplicateConfirmation(false);
    setPendingFileData(null);
    setDuplicateResult(null);
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
            {isUploading ? '上傳中...' : '選擇 CSV 檔案'}
          </label>
        </div>

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

        {/* 檔案格式說明 */}
        <div className="file-info">
          <h4>檔案格式要求：</h4>
          <ul>
            <li>檔案格式：{FILE_UPLOAD_LIMITS.ALLOWED_EXTENSIONS.join(', ')}</li>
            <li>檔案大小：最大 {(FILE_UPLOAD_LIMITS.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB</li>
            <li>資料筆數：最大 {FILE_UPLOAD_LIMITS.MAX_ROWS.toLocaleString()} 筆</li>
            <li>第一行：必須為欄位名稱</li>
            <li>編碼：UTF-8</li>
            <li><strong>重複檢查：</strong>系統會自動檢查是否有重複資料</li>
          </ul>
        </div>

        {/* 認證狀態 */}
        <div className="server-status">
          <small>
            🔒 已通過身份驗證
          </small>
        </div>
      </div>

      {/* 重複確認對話框 */}
      <DuplicateConfirmation
        visible={showDuplicateConfirmation}
        duplicateResult={duplicateResult}
        columns={pendingFileData?.columns || []}
        fileName={pendingFileData?.file?.name || ''}
        onConfirm={handleDuplicateConfirm}
        onCancel={handleDuplicateCancel}
        loading={isUploading}
      />
    </div>
  );
}; 