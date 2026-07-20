import React from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  headerAction
}) => {
  return (
    <div className="p-6 border border-border rounded-premium bg-white shadow-premium flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-bold text-text-primary font-title">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-text-secondary">
              {description}
            </p>
          )}
        </div>
        {headerAction && (
          <div className="shrink-0">
            {headerAction}
          </div>
        )}
      </div>

      <div className="w-full h-72 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
