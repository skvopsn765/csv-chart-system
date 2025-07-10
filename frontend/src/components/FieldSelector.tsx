import React from 'react';

interface FieldSelectorProps {
  columns: string[];
  csvData: { [key: string]: string | number }[] | null;
  selectedXAxis: string;
  selectedYAxis: string[];
  onXAxisChange: (field: string) => void;
  onYAxisChange: (fields: string[]) => void;
}

const FieldSelector: React.FC<FieldSelectorProps> = ({ 
  columns, 
  csvData, 
  selectedXAxis, 
  selectedYAxis, 
  onXAxisChange, 
  onYAxisChange 
}) => {
  
  // 檢查欄位是否為數值類型
  const isNumericColumn = (columnName: string): boolean => {
    if (!csvData || csvData.length === 0) return false;
    
    // 檢查前幾筆資料是否都是數字
    const sampleSize = Math.min(10, csvData.length);
    let numericCount = 0;
    
    for (let i = 0; i < sampleSize; i++) {
      const value = csvData[i][columnName];
      if (value !== null && value !== undefined && value !== '') {
        const numValue = parseFloat(String(value));
        if (!isNaN(numValue)) {
          numericCount++;
        }
      }
    }
    
    // 如果超過 70% 的資料是數字，認為是數值欄位
    return numericCount / sampleSize > 0.7;
  };

  // 取得數值欄位列表
  const getNumericColumns = (): string[] => {
    return columns.filter(column => isNumericColumn(column));
  };

  // 處理 X 軸欄位選擇
  const handleXAxisChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedValue = event.target.value;
    onXAxisChange(selectedValue);
  };

  // 處理 Y 軸欄位選擇
  const handleYAxisChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedValue = event.target.value;
    const isChecked = event.target.checked;
    
    let newSelectedYAxis = [...selectedYAxis];
    
    if (isChecked) {
      // 加入選擇的欄位
      if (!newSelectedYAxis.includes(selectedValue)) {
        newSelectedYAxis.push(selectedValue);
      }
    } else {
      // 移除選擇的欄位
      newSelectedYAxis = newSelectedYAxis.filter(axis => axis !== selectedValue);
    }
    
    onYAxisChange(newSelectedYAxis);
  };

  const numericColumns = getNumericColumns();

  return (
    <div className="field-selector">
      <h3>選擇圖表欄位</h3>
      
      <div className="selector-grid">
        {/* X 軸選擇 */}
        <div className="x-axis-selector">
          <h4>X 軸欄位（單選）</h4>
          <div className="field-options">
            <div className="radio-option">
              <input
                type="radio"
                id="x-axis-none"
                name="x-axis"
                value=""
                checked={selectedXAxis === ''}
                onChange={handleXAxisChange}
              />
              <label htmlFor="x-axis-none">請選擇欄位</label>
            </div>
            
            {columns.map((column) => (
              <div key={column} className="radio-option">
                <input
                  type="radio"
                  id={`x-axis-${column}`}
                  name="x-axis"
                  value={column}
                  checked={selectedXAxis === column}
                  onChange={handleXAxisChange}
                />
                <label htmlFor={`x-axis-${column}`}>
                  {column}
                  {isNumericColumn(column) && <span className="field-type">（數值）</span>}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Y 軸選擇 */}
        <div className="y-axis-selector">
          <h4>Y 軸欄位（多選）</h4>
          <div className="field-options">
            {numericColumns.length === 0 ? (
              <p className="no-numeric-fields">沒有找到數值欄位</p>
            ) : (
              numericColumns.map((column) => (
                <div key={column} className="checkbox-option">
                  <input
                    type="checkbox"
                    id={`y-axis-${column}`}
                    value={column}
                    checked={selectedYAxis.includes(column)}
                    onChange={handleYAxisChange}
                  />
                  <label htmlFor={`y-axis-${column}`}>
                    {column}
                    <span className="field-type">（數值）</span>
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 選擇狀態提示 */}
      <div className="selection-status">
        <div className="status-info">
          <strong>目前選擇：</strong>
          <br />
          X 軸：{selectedXAxis || '未選擇'}
          <br />
          Y 軸：{selectedYAxis.length > 0 ? selectedYAxis.join(', ') : '未選擇'}
        </div>
        
        {selectedXAxis && selectedYAxis.length > 0 && (
          <div className="ready-indicator">
            ✓ 已準備好繪製圖表
          </div>
        )}
      </div>

      {/* 欄位類型說明 */}
      <div className="field-info">
        <h4>欄位類型說明：</h4>
        <ul>
          <li>X 軸：可選擇任何欄位（文字、數字、日期）</li>
          <li>Y 軸：只能選擇數值欄位</li>
          <li>數值欄位：系統自動判斷，需 70% 以上資料為數字</li>
          <li>可同時選擇多個 Y 軸欄位進行比較</li>
        </ul>
      </div>
    </div>
  );
};

export default FieldSelector; 