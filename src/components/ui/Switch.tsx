import React, { forwardRef } from 'react';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  label,
  description,
  className = '',
  id,
  checked,
  onChange,
  ...props
}, ref) => {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label htmlFor={switchId} className="text-sm font-semibold text-pixel-neutral-900 font-title">
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-pixel-neutral-500 leading-normal font-sans">
              {description}
            </span>
          )}
        </div>
      )}
      <label htmlFor={switchId} className="relative inline-flex items-center cursor-pointer select-none">
        <input
          ref={ref}
          id={switchId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          {...props}
        />
        <div className="w-11 h-6 bg-pixel-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-teal/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-pixel-neutral-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pixel-navy-900"></div>
      </label>
    </div>
  );
});

Switch.displayName = 'Switch';
