import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1.5 md:space-x-2 text-xs font-medium text-text-secondary">
        <li className="inline-flex items-center">
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-1.5 hover:text-text-primary transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Início</span>
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="inline-flex items-center gap-1.5 md:gap-2">
              <ChevronRight className="h-3.5 w-3.5 text-white/40 shrink-0" />
              {item.link && !isLast ? (
                <Link
                  to={item.link}
                  className="hover:text-text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-text-primary font-semibold truncate max-w-[120px] md:max-w-none">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
