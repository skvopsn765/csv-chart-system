import React, { useState, useRef } from 'react';
import { Button, message, Progress, Typography, Card, Space, Alert } from 'antd';
import { UploadOutlined, FileTextOutlined, DeleteOutlined } from '@ant-design/icons';
import { AimTrainerUploadProps, AimTrainerUploadResult } from '../../../shared/types/aimtrainer';
import { apiRequest } from '../../../features/auth/utils/auth';
import './index.css';

const { Title, Text } = Typography;

const AimTrainerUploader: React.FC<AimTrainerUploadProps> = ({ 
  onUploadComplete, 
  onError 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<AimTrainerUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 處理文件選擇
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // 過濾只允許 .txt 文件
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.name.toLowerCase().endsWith('.txt');
      const isAimTrainerFile = file.name.toLowerCase().includes('aimtrainer_results');
      
      if (!isValidType) {
        message.error(`${file.name} 不是有效的文件類型，請選擇 .txt 文件`);
        return false;
      }
      
      if (!isAimTrainerFile) {
        message.warning(`${file.name} 可能不是 AimTrainer 結果文件`);
      }
      
      return true;
    });
    
    // 檢查重複文件
    const newFiles = validFiles.filter(newFile => {
      const isDuplicate = files.some(existingFile => 
        existingFile.name === newFile.name
      );
      
      if (isDuplicate) {
        message.warning(`檔案 ${newFile.name} 已經存在，跳過添加`);
        return false;
      }
      
      return true;
    });
    
    setFiles(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      message.success(`已添加 ${newFiles.length} 個文件`);
    }
  };

  // 移除文件
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    message.success('已移除文件');
  };

  // 清空所有文件
  const handleClearFiles = () => {
    setFiles([]);
    setUploadResult(null);
    message.success('已清空所有文件');
  };

  // 上傳文件到後端
  const handleUploadFiles = async () => {
    if (files.length === 0) {
      message.error('請先選擇文件');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      // 準備 FormData
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      // 發送到後端
      const response = await apiRequest('/api/aimtrainer/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '上傳失敗');
      }

      const result = await response.json();
      const data: AimTrainerUploadResult = result.data;
      
      setUploadResult(data);
      onUploadComplete(data);
      
      message.success(
        `上傳完成！處理了 ${data.processedFiles} 個文件，新增 ${data.newRecords} 筆記錄`
      );
      
      // 清空文件列表
      setFiles([]);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上傳時發生未知錯誤';
      onError(errorMessage);
      message.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="aimtrainer-uploader">
      <Card>
        <Title level={4}>
          <FileTextOutlined /> AimTrainer 資料文件上傳
        </Title>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 文件選擇區域 */}
          <div className="file-upload-section">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <Space>
              <Button
                icon={<UploadOutlined />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                選擇 AimTrainer 文件
              </Button>
              
              {files.length > 0 && (
                <Button
                  icon={<DeleteOutlined />}
                  onClick={handleClearFiles}
                  disabled={uploading}
                  danger
                >
                  清空所有文件
                </Button>
              )}
            </Space>
            
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              支援選擇多個 aimtrainer_results_*.txt 文件，系統會自動移除重複的訓練記錄
            </Text>
          </div>

          {/* 已選擇文件列表 */}
          {files.length > 0 && (
            <div className="selected-files">
              <Title level={5}>已選擇的文件 ({files.length})</Title>
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <Space>
                      <FileTextOutlined />
                      <Text>{file.name}</Text>
                      <Text type="secondary">({(file.size / 1024).toFixed(1)} KB)</Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveFile(index)}
                        disabled={uploading}
                        danger
                      />
                    </Space>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 上傳按鈕 */}
          <div className="upload-section">
            <Button
              type="primary"
              size="large"
              onClick={handleUploadFiles}
              disabled={files.length === 0 || uploading}
              loading={uploading}
            >
              {uploading ? '上傳中...' : '開始上傳到資料庫'}
            </Button>
          </div>

          {/* 上傳進度 */}
          {uploading && (
            <Progress percent={100} status="active" showInfo={false} />
          )}

          {/* 上傳結果 */}
          {uploadResult && (
            <Alert
              message="上傳完成"
              description={
                <div>
                  <p><strong>總文件數：</strong>{uploadResult.totalFiles}</p>
                  <p><strong>處理成功：</strong>{uploadResult.processedFiles}</p>
                  <p><strong>跳過文件：</strong>{uploadResult.skippedFiles}</p>
                  <p><strong>新增記錄：</strong>{uploadResult.newRecords}</p>
                  <p><strong>移除重複：</strong>{uploadResult.duplicatesRemoved}</p>
                  {uploadResult.errors.length > 0 && (
                    <p><strong>錯誤：</strong>{uploadResult.errors.join(', ')}</p>
                  )}
                </div>
              }
              type="success"
              showIcon
            />
          )}
        </Space>
      </Card>
    </div>
  );
};

export default AimTrainerUploader; 