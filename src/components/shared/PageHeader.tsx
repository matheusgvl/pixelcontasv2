import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import type { BreadcrumbItem } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  action
}) => {
  return (
    <div className="flex flex-col gap-3 w-full border-b border-pixel-neutral-200 pb-5 mb-6">
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-black text-pixel-navy-900 font-title tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs md:text-sm text-pixel-neutral-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex items-center gap-3 shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
