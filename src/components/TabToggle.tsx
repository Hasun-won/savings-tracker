import React from 'react';

interface TabToggleItem {
  key: string;
  label: string;
}

interface TabToggleProps {
  items: TabToggleItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

const TabToggle: React.FC<TabToggleProps> = ({ items, activeKey, onChange }) => (
  <div className="tab-toggle">
    {items.map(item => (
      <button
        key={item.key}
        type="button"
        className={item.key === activeKey ? 'tab-button active' : 'tab-button'}
        onClick={() => onChange(item.key)}
      >
        {item.label}
      </button>
    ))}
  </div>
);

export default TabToggle;
