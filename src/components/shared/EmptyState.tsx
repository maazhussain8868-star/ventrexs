import React from 'react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-2xl ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary mb-4 shadow-xs">
        {icon || <span className="material-symbols-outlined text-3xl">inbox</span>}
      </div>
      <h3 className="text-base font-bold text-on-surface mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
