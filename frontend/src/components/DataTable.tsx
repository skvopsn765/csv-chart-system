import React from 'react';
import './DataTable.css';

interface DataTableProps {
  data: { [key: string]: string | number }[] | null;
  columns: string[];
}

const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  // 如果沒有資料，顯示提示
  if (!data || data.length === 0) {
    return (
      <div className="data-table-empty">
        <p>尚無資料可顯示</p>
        <p>請先上傳 CSV 檔案</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="data-table-header">
        <h3>📊 資料表格</h3>
        <div className="data-table-info">
          <span>總筆數: {data.length}</span>
          <span>欄位數: {columns.length}</span>
        </div>
      </div>

      <div className="data-table-wrapper">
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
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td className="row-number">{rowIndex + 1}</td>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="data-cell">
                    {row[column] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable; 