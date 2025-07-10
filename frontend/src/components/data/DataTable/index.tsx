import React from 'react';
import { DataTableProps } from '../../../shared/types';
import './index.css';

export const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  
  // 如果沒有資料，顯示空狀態
  if (!data || data.length === 0) {
    return (
      <div className="data-table-container">
        <div className="empty-state">
          <h3>沒有資料可顯示</h3>
          <p>請上傳 CSV 檔案以查看資料內容</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h3>資料表格</h3>
        <div className="table-info">
          <span>共 {data.length} 筆資料</span>
          <span>共 {columns.length} 個欄位</span>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th className="row-number-header">#</th>
              {columns.map((column, index) => (
                <th key={index} className="column-header">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="data-row">
                <td className="row-number">{rowIndex + 1}</td>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="data-cell">
                    {row[column] !== null && row[column] !== undefined 
                      ? String(row[column]) 
                      : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="table-footer">
        <div className="pagination-info">
          顯示第 1 - {data.length} 筆，共 {data.length} 筆資料
        </div>
      </div>
    </div>
  );
}; 