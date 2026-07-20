import React, { forwardRef } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  helperText,
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-text-primary font-title">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`w-full py-2.5 pl-3.5 pr-10 text-sm text-text-primary bg-white border rounded-soft shadow-sm appearance-none transition-all duration-200
            ${error 
              ? 'border-functional-error focus:border-functional-error focus:ring-4 focus:ring-functional-error/10' 
              : 'border-border focus:border-primary focus:ring-4 focus:ring-primary/20'
            }
            disabled:bg-border disabled:text-text-secondary disabled:cursor-not-allowed`}
          {...props}
        >
          {children || options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error ? (
        <span className="text-xs font-medium text-red-600">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-xs text-text-secondary">
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
