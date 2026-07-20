import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
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
    <div className={`border-b border-border ${className}`}>
      <nav className="flex space-x-6 -mb-px" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`group inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200
                ${isActive
                  ? 'border-black text-text-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
            >
              {tab.icon && (
                <span className={`text-current ${isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                  {tab.icon}
                </span>
              )}
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
