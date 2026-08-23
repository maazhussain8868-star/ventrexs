import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-surface border-t border-outline-variant text-xs text-on-surface-variant ${className}`}>
      <div>
        Showing <span className="font-semibold text-on-surface">{start}</span> to <span className="font-semibold text-on-surface">{end}</span> of <span className="font-semibold text-on-surface">{totalItems}</span> results
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center justify-center p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-on-surface"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-7 h-7 rounded-lg font-medium text-xs transition-colors ${
              pageNum === currentPage
                ? 'bg-primary text-on-primary font-bold'
                : 'hover:bg-surface-container-low text-on-surface'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center justify-center p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-on-surface"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
