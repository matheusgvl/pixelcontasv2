import React, { forwardRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string | React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={checkboxId} className="inline-flex items-start gap-2.5 cursor-pointer select-none">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded text-pixel-navy-900 focus:ring-brand-teal/40 border-pixel-neutral-200 transition duration-150 cursor-pointer accent-pixel-navy-900"
          {...props}
        />
        <span className="text-sm text-pixel-neutral-900 leading-normal font-sans">
          {label}
        </span>
      </label>
      {error && (
        <span className="text-xs font-medium text-red-600 ml-6">
          {error}
        </span>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
