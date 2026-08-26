import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'elevated' | 'glass';
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs',
    flat: 'bg-surface-container-low border border-outline-variant/60 rounded-2xl',
    elevated: 'bg-surface border border-outline-variant rounded-2xl shadow-md',
    glass: 'bg-surface/80 backdrop-blur-md border border-outline-variant/70 rounded-2xl shadow-sm',
  }[variant];

  return (
    <div className={`${variantClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, action, className = '', children }) => {
  if (children) {
    return <div className={`p-5 sm:p-6 border-b border-outline-variant/60 ${className}`}>{children}</div>;
  }

  return (
    <div className={`p-5 sm:p-6 border-b border-outline-variant/60 flex items-center justify-between gap-4 ${className}`}>
      <div>
        {title && <h3 className="text-base sm:text-lg font-bold text-on-surface">{title}</h3>}
        {subtitle && <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = '', children }) => {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = '', children }) => {
  return (
    <div className={`p-4 sm:p-6 border-t border-outline-variant/60 bg-surface-container-low/40 rounded-b-2xl flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  );
};
