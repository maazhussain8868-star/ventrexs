import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 4,
  className = ''
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-surface-container-high rounded-xl w-full" />
      ))}
    </div>
  );
};
