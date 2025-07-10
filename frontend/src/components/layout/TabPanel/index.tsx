import React, { useState } from 'react';
import { TabPanelProps, TabProps } from '../../../shared/types';
import './index.module.css';

export const TabPanel: React.FC<TabPanelProps> = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState<number>(defaultTab);

  const handleTabClick = (index: number): void => {
    setActiveTab(index);
  };

  return (
    <div className="tab-panel">
      <div className="tab-headers">
        {children.map((tab, index) => (
          <button
            key={index}
            className={`tab-header ${activeTab === index ? 'active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            {tab.props.title}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {children[activeTab] && children[activeTab].props.children}
      </div>
    </div>
  );
};

export const Tab: React.FC<TabProps> = ({ title, children }) => {
  return <div data-title={title}>{children}</div>;
}; 