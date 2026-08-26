import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  change?: {
    value: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  change,
  icon,
  variant = 'default',
  onClick,
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-surface-container-lowest border-outline-variant hover:border-outline-variant/80',
    primary: 'bg-primary-fixed/20 border-primary/20 hover:border-primary/40',
    success: 'bg-tertiary-container/10 border-tertiary/20 hover:border-tertiary/40',
    warning: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40',
    error: 'bg-error-container/20 border-error/20 hover:border-error/40',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-xs flex flex-col justify-between ${variantStyles} ${
        onClick ? 'cursor-pointer hover:shadow-sm active:scale-[0.99]' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-on-surface-variant truncate uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0 shadow-2xs">
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          {value}
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${
                change.isPositive !== false
                  ? 'bg-tertiary-container/20 text-tertiary'
                  : 'bg-error-container/40 text-error'
              }`}
            >
              {change.isPositive !== false ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {change.value}
            </span>
          )}

          {subtext && <span className="text-xs text-on-surface-variant font-medium">{subtext}</span>}
        </div>
      </div>
    </div>
  );
};
