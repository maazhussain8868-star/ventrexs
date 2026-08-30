'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { LeadSourceRoiMetric } from '@/lib/analytics/types';
import { AnalyticsService } from '@/lib/supabase/services/analytics';
import {
  Users,
  DollarSign,
  TrendingUp,
  Download,
  ArrowLeft,
  ShieldCheck,
  Info,
  ChevronRight,
} from 'lucide-react';

export default function LeadSourcesReportPage() {
  const { user, isDemoMode, leads, invoices, showToast, businessProfile, profile } = useApp();
  const [sources, setSources] = useState<LeadSourceRoiMetric[]>([]);

  const analyticsService = new AnalyticsService();

  useEffect(() => {
    const isDemo = isDemoMode || (!user && leads.length === 0);
    if (isDemo) {
      const list = analyticsService.getDemoLeadSourceRoi();
      setSources(list);
    } else {
      const list = analyticsService.getLeadSourceRoiFromData({ leads, invoices });
      setSources(list);
    }
  }, [user, isDemoMode, leads, invoices]);

  const handleExportCsv = () => {
    const timestamp = new Date().toISOString();
    let csv = `Report: Ventrexs AI Lead Source ROI Report\n`;
    csv += `Business: ${businessProfile?.name || profile.businessName}\n`;
    csv += `Generated: ${timestamp}\n\n`;
    csv += `Source Channel,Leads Count,Qualified Count,Estimates Sent,Won Deals,Revenue ($),Conversion Rate (%),Ad Spend ($),Cost Per Lead ($),CAC ($)\n`;

    for (const s of sources) {
      csv += `"${s.source}",${s.leadsCount},${s.qualifiedCount},${s.estimatesCount},${s.wonDealsCount},${s.revenue},${s.conversionRate}%,${s.adSpend || 'N/A'},${s.costPerLead || 'N/A'},${s.customerAcquisitionCost || 'N/A'}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Ventrexs_Lead_Source_ROI_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'Report Downloaded',
      description: 'Lead source ROI exported to CSV.',
      type: 'success',
    });
  };

  return (
    <AppShell
      title="Lead Source & Acquisition ROI"
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
              Marketing Acquisition & Lead Source ROI
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-container/20 text-primary">
              <ShieldCheck className="w-3.5 h-3.5" />
              Channel Attribution
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Inbound volume, qualification conversion rates, revenue generation, and customer acquisition costs per source channel.
          </p>
        </div>

        {/* Lead Source Performance Table */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant text-on-surface-variant uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-bold">Marketing Channel</th>
                  <th className="pb-3 font-bold text-right">Inbound Leads</th>
                  <th className="pb-3 font-bold text-right">Qualified</th>
                  <th className="pb-3 font-bold text-right">Won Deals</th>
                  <th className="pb-3 font-bold text-right">Revenue</th>
                  <th className="pb-3 font-bold text-right">Conversion Rate</th>
                  <th className="pb-3 font-bold text-right">Ad Spend</th>
                  <th className="pb-3 font-bold text-right">Cost per Lead</th>
                  <th className="pb-3 font-bold text-right">CAC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-on-surface">
                {sources.map((s) => (
                  <tr key={s.source} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 font-bold">{s.source}</td>
                    <td className="py-3.5 text-right font-mono text-on-surface-variant">{s.leadsCount}</td>
                    <td className="py-3.5 text-right font-mono text-on-surface-variant">{s.qualifiedCount}</td>
                    <td className="py-3.5 text-right font-mono font-medium">{s.wonDealsCount}</td>
                    <td className="py-3.5 text-right font-mono font-bold text-primary">
                      ${s.revenue.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right font-mono">
                      <span
                        className={`font-bold ${
                          s.conversionRate >= 45 ? 'text-emerald-600 dark:text-emerald-400' : 'text-on-surface'
                        }`}
                      >
                        {s.conversionRate}%
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono">
                      {s.costDataAvailable && s.adSpend !== undefined ? (
                        `$${s.adSpend.toLocaleString()}`
                      ) : (
                        <span className="text-on-surface-variant italic text-[11px]">Organic / Direct</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right font-mono">
                      {s.costDataAvailable && s.costPerLead !== undefined ? (
                        `$${s.costPerLead}`
                      ) : (
                        <span className="text-on-surface-variant italic text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right font-mono">
                      {s.costDataAvailable && s.customerAcquisitionCost !== undefined ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ${s.customerAcquisitionCost}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant italic text-[11px]">N/A</span>
                      )}
                    </td>
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
