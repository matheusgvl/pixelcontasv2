import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-soft transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90 focus:ring-primary/40 border border-transparent shadow-sm',
    secondary: 'bg-black text-white hover:bg-black/90 focus:ring-black/40 border border-transparent shadow-sm',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white focus:ring-primary/20',
    danger: 'bg-functional-error text-white hover:opacity-90 focus:ring-functional-error/40 border border-transparent shadow-sm',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary focus:ring-primary/20',
    premium: 'bg-primary text-white hover:opacity-90 focus:ring-primary/40 border border-transparent shadow-md',
    neutral: 'bg-white text-black border border-border hover:border-primary focus:ring-primary/20 shadow-sm'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base'
  };

  const disabledStyle = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabledStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2.5 h-4.5 w-4.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="mr-2 inline-flex">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
