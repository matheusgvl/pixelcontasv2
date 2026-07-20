import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  suffix,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-text-primary font-title">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-text-secondary pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full py-2.5 px-3.5 text-sm text-text-primary bg-white border rounded-soft shadow-sm transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${suffix ? 'pr-10' : ''}
            ${error 
              ? 'border-functional-error focus:border-functional-error focus:ring-4 focus:ring-functional-error/10' 
              : 'border-border focus:border-primary focus:ring-4 focus:ring-primary/20'
            }
            placeholder:text-text-muted disabled:bg-border disabled:text-text-secondary disabled:cursor-not-allowed`}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 text-text-secondary">
            {suffix}
          </div>
        )}
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

Input.displayName = 'Input';
