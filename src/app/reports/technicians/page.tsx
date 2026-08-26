'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { TechnicianPerformanceReport } from '@/lib/analytics/types';
import { AnalyticsService } from '@/lib/supabase/services/analytics';
import {
  Wrench,
  Star,
  DollarSign,
  Download,
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  Info,
} from 'lucide-react';

export default function TechnicianReportsPage() {
  const { showToast, businessProfile, profile } = useApp();
  const [technicians, setTechnicians] = useState<TechnicianPerformanceReport[]>([]);

  const analyticsService = new AnalyticsService();

  useEffect(() => {
    const list = analyticsService.getTechnicianPerformance();
    setTechnicians(list);
  }, []);

  const handleExportCsv = () => {
    const csv = analyticsService.generateCsvExport(
      'technicians',
      businessProfile?.name || profile.businessName
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Ventrexs_Technician_Performance_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'Report Downloaded',
      description: 'Technician indicators exported to CSV.',
      type: 'success',
    });
  };

  return (
    <AppShell
      title="Technician Performance Indicators"
      actions={
        <div className="flex items-center gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />} className="text-xs">
              Back to Reports
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Export CSV
          </Button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="pb-4 border-b border-outline-variant/60">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Technician Field Operations & Efficiency
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-container/20 text-primary">
              <ShieldCheck className="w-3.5 h-3.5" />
              Objective Indicators
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Job completion rates, field velocity, customer satisfaction ratings, and attributed revenue per technician.
          </p>
        </div>

        {/* Ethical / Neutral Notice */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-3 text-xs text-on-surface-variant">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            <strong className="text-on-surface font-semibold">Objective Indicator Framework:</strong> Metrics represent informational indicators computed from verified work orders and customer reviews.
          </p>
        </div>

        {/* Technician Performance Table */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant text-on-surface-variant uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-bold">Technician</th>
                  <th className="pb-3 font-bold text-right">Assigned</th>
                  <th className="pb-3 font-bold text-right">Completed</th>
                  <th className="pb-3 font-bold text-right">Completion Rate</th>
                  <th className="pb-3 font-bold text-right">Avg Duration</th>
                  <th className="pb-3 font-bold text-right">Attributed Revenue</th>
                  <th className="pb-3 font-bold text-right">Avg Job Value</th>
                  <th className="pb-3 font-bold text-right">Rating</th>
                  <th className="pb-3 font-bold text-right">Reviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-on-surface">
                {technicians.map((tech) => (
                  <tr key={tech.technicianName} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 font-bold flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        {tech.technicianName.charAt(0)}
                      </div>
                      <span>{tech.technicianName}</span>
                    </td>
                    <td className="py-3.5 text-right font-mono text-on-surface-variant">{tech.assignedJobs}</td>
                    <td className="py-3.5 text-right font-mono font-medium">{tech.completedJobs}</td>
                    <td className="py-3.5 text-right font-mono">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {tech.completionRate}%
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono text-on-surface-variant">
                      {tech.avgCompletionHours} hrs
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-primary">
                      ${tech.attributedRevenue.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right font-mono text-on-surface-variant">
                      ${tech.avgJobValue.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right font-mono">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {tech.customerRating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono text-on-surface-variant">{tech.reviewCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
