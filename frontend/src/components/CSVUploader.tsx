import React, { useState } from 'react';
import { apiRequest } from '../utils/auth';

// 最大檔案大小常數 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// 最大資料筆數常數
const MAX_ROWS = 5000;

interface CSVUploaderProps {
  onUpload: (rows: { [key: string]: string | number }[], columns: string[]) => void;
}

interface BackendResponse {
  success: boolean;
  data?: {
    columns: string[];
    rows: { [key: string]: string | number }[];
  };
  error?: string;
  details?: string;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onUpload }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // 驗證檔案格式
  const validateFile = (file: File): string | null => {
    // 檢查檔案副檔名
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv')) {
      return '請選擇 CSV 檔案（.csv 副檔名）';
    }

    // 檢查檔案大小
    if (file.size > MAX_FILE_SIZE) {
      return '檔案大小超過限制（最大 10MB）';
    }

    // 檢查 MIME 類型
    const validMimeTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    if (!validMimeTypes.includes(file.type) && file.type !== '') {
      return '檔案格式不正確';
    }

    return null;
  };

  // 上傳檔案到後端
  const uploadFileToBackend = async (file: File): Promise<BackendResponse> => {
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await apiRequest('/api/upload-csv', {
        method: 'POST',
        body: formData
        // 不設置 headers，讓 apiRequest 自動處理
      });

      const result: BackendResponse = await response.json();

      if (!response.ok) {
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
      
      // 上傳到後端
      const result = await uploadFileToBackend(file);
      
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
            <li>檔案格式：.csv</li>
            <li>檔案大小：最大 10MB</li>
            <li>資料筆數：最大 {MAX_ROWS.toLocaleString()} 筆</li>
            <li>第一行：必須為欄位名稱</li>
            <li>編碼：UTF-8</li>
          </ul>
        </div>

        {/* 認證狀態 */}
        <div className="server-status">
          <small>
            🔒 已通過身份驗證
          </small>
        </div>
      </div>
    </div>
  );
};

export default CSVUploader; 