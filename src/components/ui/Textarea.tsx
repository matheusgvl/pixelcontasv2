import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 3,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="text-xs font-semibold text-text-primary font-title">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`w-full py-2.5 px-3.5 text-sm text-text-primary bg-white border rounded-soft shadow-sm transition-all duration-200 resize-none
          ${error 
            ? 'border-red-600 focus:border-red-600 focus:ring-4 focus:ring-functional-error/10' 
            : 'border-border focus:border-black focus:ring-4 focus:ring-primary/10'
          }
          placeholder:text-white/50 disabled:bg-border disabled:text-text-secondary disabled:cursor-not-allowed`}
        {...props}
      />
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

Textarea.displayName = 'Textarea';
