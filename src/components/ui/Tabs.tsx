import React from 'react';

interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs whitespace-nowrap transition-all duration-150 ${
              isActive
                ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                : 'bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-container-low'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-primary/20 text-primary font-bold' : 'bg-surface-variant text-on-surface-variant'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
