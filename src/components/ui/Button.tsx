import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant shadow-sm focus:ring-primary',
    secondary: 'bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-low focus:ring-secondary',
    outline: 'bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container-low focus:ring-primary',
    ghost: 'bg-transparent text-primary hover:bg-surface-container-low focus:ring-primary',
    danger: 'bg-error text-on-error hover:opacity-90 shadow-sm focus:ring-error',
    ai: 'bg-gradient-to-r from-primary to-primary-container text-on-primary hover:opacity-95 shadow-sm ai-glow focus:ring-primary'
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
