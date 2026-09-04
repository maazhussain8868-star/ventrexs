import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-11/12 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
        };

        const borders = {
          success: 'border-emerald-200 bg-white text-emerald-950',
          error: 'border-rose-200 bg-white text-rose-950',
          warning: 'border-amber-200 bg-white text-amber-950',
          info: 'border-blue-200 bg-white text-blue-950'
        };

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border pointer-events-auto transition-all animate-bounce-short ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <p className="text-xs font-semibold leading-tight">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
};
