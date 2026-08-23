'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle, AlertCircle, Info, Sparkles, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let icon = <CheckCircle className="w-5 h-5 text-tertiary shrink-0" />;
        let borderClass = 'border-tertiary/30 bg-surface-container-lowest';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-error shrink-0" />;
          borderClass = 'border-error/30 bg-surface-container-lowest';
        } else if (toast.type === 'ai') {
          icon = <Sparkles className="w-5 h-5 text-primary shrink-0" />;
          borderClass = 'border-primary/40 bg-surface-container-lowest shadow-md ai-glow';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-primary shrink-0" />;
          borderClass = 'border-outline-variant bg-surface-container-lowest';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderClass} shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-2`}
          >
            {icon}
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-on-surface">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-on-surface-variant mt-0.5 whitespace-pre-line leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
