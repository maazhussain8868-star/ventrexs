import React from 'react';

interface BentoMetricCardProps {
  label: string;
  amount: number | string;
  type: 'primary' | 'error' | 'surface' | 'tertiary';
  changeText?: string;
  subtext?: string;
  isCurrency?: boolean;
}

export const BentoMetricCard: React.FC<BentoMetricCardProps> = ({
  label,
  amount,
  type,
  changeText,
  subtext,
  isCurrency = true
}) => {
  const colorMap = {
    primary: {
      text: 'text-primary',
      bgGlow: 'bg-primary-fixed/25',
      badge: 'bg-primary-container/10 text-primary',
    },
    error: {
      text: 'text-error',
      bgGlow: 'bg-error-container/30',
      badge: 'bg-error/10 text-error',
    },
    surface: {
      text: 'text-on-surface',
      bgGlow: 'bg-surface-variant/50',
      badge: 'bg-surface-variant text-on-surface-variant',
    },
    tertiary: {
      text: 'text-tertiary',
      bgGlow: 'bg-tertiary-container/15',
      badge: 'bg-tertiary-container/20 text-tertiary',
    },
  }[type];

  const formattedAmount = typeof amount === 'number' 
    ? (isCurrency ? `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : amount.toLocaleString())
    : amount;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-primary/30 transition-all relative overflow-hidden group">
      {/* Ambient background glow matching Stitch */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 ${colorMap.bgGlow} rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs sm:text-sm font-semibold text-on-surface-variant">{label}</p>
          {changeText && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colorMap.badge}`}>
              {changeText}
            </span>
          )}
        </div>
        <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${colorMap.text} font-mono`}>
          {formattedAmount}
        </p>
      </div>

      {subtext && (
        <div className="relative z-10 mt-3 pt-2.5 border-t border-outline-variant/40 text-[11px] font-medium text-on-surface-variant flex items-center justify-between">
          <span>{subtext}</span>
          <span className="text-outline text-[10px]">Original Balance</span>
        </div>
      )}
    </div>
  );
};
