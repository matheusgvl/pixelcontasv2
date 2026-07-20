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
    primary: 'bg-pixel-navy-900 text-white hover:bg-pixel-navy-950 focus:ring-brand-teal/40 border border-transparent shadow-sm',
    secondary: 'bg-pixel-navy-900 text-white hover:bg-pixel-navy-950 focus:ring-brand-navy/40 border border-transparent shadow-sm',
    outline: 'bg-transparent text-pixel-navy-900 border border-brand-navy/20 hover:bg-pixel-neutral-100 focus:ring-brand-navy/20',
    danger: 'bg-red-600 text-white hover:bg-red-800 focus:ring-functional-error/40 border border-transparent shadow-sm',
    ghost: 'bg-transparent text-pixel-neutral-500 hover:bg-pixel-neutral-50 hover:text-pixel-navy-950 focus:ring-brand-teal/20',
    premium: 'bg-grad-premium text-white hover:shadow-premium-hover focus:ring-brand-copper/40 border border-transparent shadow-md'
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
