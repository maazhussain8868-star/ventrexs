'use client';

import React, { useState } from 'react';
import { DateRangePreset, DateRangeFilter } from '@/lib/analytics/types';
import { Calendar, ChevronDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DateRangePickerProps {
  value: DateRangePreset;
  onChange: (preset: DateRangePreset, customStart?: string, customEnd?: string) => void;
  startDate?: string;
  endDate?: string;
}

export function DateRangePicker({
  value,
  onChange,
  startDate,
  endDate,
}: DateRangePickerProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState(
    startDate ? startDate.substring(0, 10) : new Date(Date.now() - 30 * 86400000).toISOString().substring(0, 10)
  );
  const [customEnd, setCustomEnd] = useState(
    endDate ? endDate.substring(0, 10) : new Date().toISOString().substring(0, 10)
  );

  const presets: { id: DateRangePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'this_year', label: 'This Year' },
  ];

  const handleCustomApply = () => {
    setIsCustomOpen(false);
    onChange('custom', new Date(customStart).toISOString(), new Date(customEnd).toISOString());
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {/* Preset Pill Bar */}
      <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-outline-variant/60 overflow-x-auto max-w-full">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setIsCustomOpen(false);
              onChange(p.id);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              value === p.id && !isCustomOpen
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {p.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setIsCustomOpen(!isCustomOpen)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
            value === 'custom' || isCustomOpen
              ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Custom</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Custom Range Drawer / Modal */}
      {isCustomOpen && (
        <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-2.5 z-20">
          <div className="flex items-center gap-1.5 text-xs text-on-surface">
            <span className="text-on-surface-variant font-medium">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-surface-container-high border border-outline-variant rounded-lg px-2.5 py-1 text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface">
            <span className="text-on-surface-variant font-medium">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-surface-container-high border border-outline-variant rounded-lg px-2.5 py-1 text-xs"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCustomApply}
            className="text-xs px-3 py-1"
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
