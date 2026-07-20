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
    <div className={`border-b border-pixel-neutral-200 ${className}`}>
      <nav className="flex space-x-6 -mb-px" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`group inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200
                ${isActive
                  ? 'border-pixel-navy-900 text-pixel-navy-900 font-semibold'
                  : 'border-transparent text-pixel-neutral-500 hover:text-pixel-neutral-900 hover:border-pixel-neutral-200'
                }`}
            >
              {tab.icon && (
                <span className={`text-current ${isActive ? 'text-pixel-navy-900' : 'text-pixel-neutral-500 group-hover:text-pixel-neutral-900'}`}>
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
