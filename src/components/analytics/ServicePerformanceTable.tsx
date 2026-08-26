'use client';

import React from 'react';
import { ServicePerformanceMetric } from '@/lib/analytics/types';
import { Star, TrendingUp, DollarSign } from 'lucide-react';

interface ServicePerformanceTableProps {
  services: ServicePerformanceMetric[];
  title?: string;
  subtitle?: string;
}

export function ServicePerformanceTable({
  services,
  title = 'Service Category Profitability & Volume',
  subtitle = 'Revenue yield, estimate conversion velocity, and customer satisfaction across your trade offerings.',
}: ServicePerformanceTableProps) {
  return (
    <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-4">
      <div>
        <h3 className="font-bold text-base text-on-surface tracking-tight">{title}</h3>
        <p className="text-xs text-on-surface-variant">{subtitle}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-outline-variant text-on-surface-variant uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-bold">Service Offering</th>
              <th className="pb-3 font-bold text-right">Leads</th>
              <th className="pb-3 font-bold text-right">Jobs</th>
              <th className="pb-3 font-bold text-right">Total Revenue</th>
              <th className="pb-3 font-bold text-right">Avg Ticket</th>
              <th className="pb-3 font-bold text-right">Estimate Approval</th>
              <th className="pb-3 font-bold text-right">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 text-on-surface">
            {services.map((s) => (
              <tr key={s.service} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3.5 font-bold">{s.service}</td>
                <td className="py-3.5 text-right font-mono text-on-surface-variant">{s.leadCount}</td>
                <td className="py-3.5 text-right font-mono font-medium">{s.jobCount}</td>
                <td className="py-3.5 text-right font-mono font-bold text-primary">
                  ${s.revenue.toLocaleString()}
                </td>
                <td className="py-3.5 text-right font-mono text-on-surface-variant">
                  ${s.avgTicket.toLocaleString()}
                </td>
                <td className="py-3.5 text-right font-mono">
                  <span
                    className={`inline-block font-bold ${
                      s.estimateApprovalRate >= 75 ? 'text-emerald-600' : 'text-on-surface'
                    }`}
                  >
                    {s.estimateApprovalRate}%
                  </span>
                </td>
                <td className="py-3.5 text-right font-mono">
                  <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {s.avgRating.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
