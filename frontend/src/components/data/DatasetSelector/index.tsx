import React, { useState, useEffect } from 'react';
import { Select, Spin, message } from 'antd';
import { apiRequest } from '../../../features/auth';
import { API_ENDPOINTS } from '../../../shared/constants';
import { DatasetsListResponse, Dataset } from '../../../shared/types';

interface DatasetSelectorProps {
  value?: number;
  onChange?: (datasetId: number, dataset: Dataset) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  value,
  onChange,
  placeholder = '選擇資料集',
  disabled = false
}) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 載入資料集列表
  const loadDatasets = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.DATASETS.LIST, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('無法載入資料集列表');
      }

      const data: DatasetsListResponse = await response.json();
      
      if (data.success && data.data) {
        setDatasets(data.data);
      } else {
        message.error('載入資料集列表失敗');
      }
    } catch (error) {
      console.error('載入資料集列表錯誤:', error);
      message.error('載入資料集列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 元件載入時獲取資料集列表
  useEffect(() => {
    loadDatasets();
  }, []);

  // 處理選擇變更
  const handleChange = (datasetId: number) => {
    const selectedDataset = datasets.find(dataset => dataset.id === datasetId);
    if (selectedDataset && onChange) {
      onChange(datasetId, selectedDataset);
    }
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled || loading}
      loading={loading}
      style={{ width: '100%', minWidth: 200 }}
      notFoundContent={loading ? <Spin size="small" /> : '沒有資料集'}
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={datasets.map(dataset => ({
        value: dataset.id,
        label: dataset.name,
        title: `${dataset.name} (${dataset.description || '無描述'})`
      }))}
    />
  );
}; 