import React from 'react';

export const LineChartTrends: React.FC = () => {
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-on-surface">Payment Speed Trends</h3>
          <p className="text-xs text-on-surface-variant">Average DSO (Days Sales Outstanding) over 6 months</p>
        </div>
        <span className="inline-flex items-center gap-1 text-tertiary font-bold text-xs bg-tertiary-container/15 px-2.5 py-1 rounded-full">
          <span className="material-symbols-outlined text-[14px]">trending_down</span>
          -4.2 Days DSO
        </span>
      </div>

      <div className="relative h-36 sm:h-44 w-full mt-2">
        <svg 
          className="w-full h-full overflow-visible" 
          preserveAspectRatio="none" 
          viewBox="0 0 500 150"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#004ac6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#004ac6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="30" x2="500" y2="30" stroke="#e5eeff" strokeDasharray="3 3" />
          <line x1="0" y1="75" x2="500" y2="75" stroke="#e5eeff" strokeDasharray="3 3" />
          <line x1="0" y1="120" x2="500" y2="120" stroke="#e5eeff" strokeDasharray="3 3" />

          {/* Area Fill */}
          <path
            d="M 0,110 Q 50,95 100,85 T 200,60 T 300,75 T 400,35 T 500,45 L 500,150 L 0,150 Z"
            fill="url(#trendGradient)"
          />

          {/* Trend Line */}
          <path
            d="M 0,110 Q 50,95 100,85 T 200,60 T 300,75 T 400,35 T 500,45"
            fill="none"
            stroke="#004ac6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {[
            { x: 0, y: 110, val: '21d' },
            { x: 100, y: 85, val: '18d' },
            { x: 200, y: 60, val: '16d' },
            { x: 300, y: 75, val: '17d' },
            { x: 400, y: 35, val: '13d' },
            { x: 500, y: 45, val: '14.2d' },
          ].map((pt, i) => (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#004ac6" strokeWidth="2.5" />
            </g>
          ))}
        </svg>
      </div>

      <div className="flex justify-between mt-3 font-semibold text-xs text-on-surface-variant px-1">
        {months.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
    </div>
  );
};
