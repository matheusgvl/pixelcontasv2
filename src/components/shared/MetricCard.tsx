import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number; // e.g. 12.5
    type: 'increase' | 'decrease';
    timeframe: string; // e.g. 'vs último mês'
  };
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  highlight = false
}) => {
  return (
    <div className={`p-6 border rounded-premium bg-white shadow-premium transition-all duration-200 hover:shadow-premium-hover flex flex-col gap-4 relative overflow-hidden
      ${highlight ? 'border-primary/30 bg-black-soft/20' : 'border-border'}`}>
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-secondary tracking-wide uppercase font-title">
          {title}
        </span>
        <div className={`p-2.5 rounded-soft shrink-0
          ${highlight ? 'bg-black text-white' : 'bg-brand-lightBlue/30 text-text-primary'}`}>
          {icon}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-2xl font-extrabold text-text-primary tracking-tight font-title">
          {value}
        </span>
        
        {change && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`inline-flex items-center font-bold
              ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {change.type === 'increase' ? (
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
              )}
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </span>
            <span className="text-text-secondary font-medium">
              {change.timeframe}
            </span>
          </div>
        )}
      </div>
      
      {/* Premium accent border on highlighted cards */}
      {highlight && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black"></div>
      )}
    </div>
  );
};
