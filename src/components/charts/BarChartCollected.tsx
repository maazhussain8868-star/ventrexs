import React from 'react';

interface BarData {
  label: string;
  collected: number;
  outstanding: number;
}

export const BarChartCollected: React.FC<{ data?: BarData[] }> = ({
  data = [
    { label: 'W1', collected: 8200, outstanding: 3100 },
    { label: 'W2', collected: 6400, outstanding: 4200 },
    { label: 'W3', collected: 9800, outstanding: 2000 },
    { label: 'W4', collected: 7700, outstanding: 3100 },
  ]
}) => {
  const maxVal = 12000;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-on-surface">Collected vs. Outstanding</h3>
          <p className="text-xs text-on-surface-variant">Weekly billing & recovery volume</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-primary rounded-xs" />
            <span className="text-on-surface">Collected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-secondary-fixed rounded-xs" />
            <span className="text-on-surface-variant">Outstanding</span>
          </div>
        </div>
      </div>

      <div className="h-44 sm:h-52 w-full flex items-end justify-around gap-4 pt-4 px-2 border-b border-outline-variant relative">
        {data.map((item, idx) => {
          const colHeight = (item.collected / maxVal) * 100;
          const outHeight = (item.outstanding / maxVal) * 100;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
              <div className="w-full max-w-[48px] flex items-end gap-1.5 justify-center h-full">
                {/* Collected Bar */}
                <div
                  style={{ height: `${colHeight}%` }}
                  className="w-1/2 bg-primary rounded-t-md hover:opacity-90 transition-all relative group/bar"
                >
                  <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap z-20 pointer-events-none transition-opacity">
                    ${item.collected.toLocaleString()}
                  </div>
                </div>

                {/* Outstanding Bar */}
                <div
                  style={{ height: `${outHeight}%` }}
                  className="w-1/2 bg-secondary-fixed rounded-t-md hover:opacity-90 transition-all relative group/bar"
                >
                  <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap z-20 pointer-events-none transition-opacity">
                    ${item.outstanding.toLocaleString()}
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant mt-2">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
