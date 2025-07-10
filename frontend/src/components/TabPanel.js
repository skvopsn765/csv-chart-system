import React, { useState } from 'react';
import './TabPanel.css';

const TabPanel = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // 確保 children 是陣列
  const tabsArray = React.Children.toArray(children);

  return (
    <div className="tab-panel">
      {/* 頁籤標頭 */}
      <div className="tab-header">
        {tabsArray.map((child, index) => (
          <button
            key={index}
            className={`tab-button ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {child.props.title}
          </button>
        ))}
      </div>

      {/* 頁籤內容 */}
      <div className="tab-content">
        {tabsArray[activeTab]}
      </div>
    </div>
  );
};

// 單一頁籤組件
const Tab = ({ title, children }) => {
  return <div className="tab-pane">{children}</div>;
};

export { TabPanel, Tab }; 