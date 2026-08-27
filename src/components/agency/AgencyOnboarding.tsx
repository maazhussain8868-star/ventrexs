'use client';

import React from 'react';
import { AgencyClient } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import {
  GitBranch,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Building2,
  Layers,
  ChevronRight,
} from 'lucide-react';

export type AgencyOnboardingStageType = 'New Client' | 'Setup' | 'Branding' | 'Domain' | 'Configuration' | 'Live';

interface AgencyOnboardingProps {
  clients: AgencyClient[];
  onOpenAddClient: () => void;
  onManageClient: (client: AgencyClient) => void;
  onUpdateClientStage?: (clientId: string, stage: AgencyOnboardingStageType) => void;
}

export const AgencyOnboarding: React.FC<AgencyOnboardingProps> = ({
  clients,
  onOpenAddClient,
  onManageClient,
  onUpdateClientStage,
}) => {
  const stages: { title: string; stage: AgencyOnboardingStageType; color: string }[] = [
    { title: 'NEW CLIENT', stage: 'New Client', color: 'border-t-blue-500' },
    { title: 'SETUP', stage: 'Setup', color: 'border-t-indigo-500' },
    { title: 'BRANDING', stage: 'Branding', color: 'border-t-violet-500' },
    { title: 'DOMAIN', stage: 'Domain', color: 'border-t-purple-500' },
    { title: 'CONFIGURATION', stage: 'Configuration', color: 'border-t-amber-500' },
    { title: 'LIVE', stage: 'Live', color: 'border-t-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Onboarding Pipeline</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage-by-stage progression tracking for new contractor SaaS accounts.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddClient}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-xs"
        >
          + Add Client
        </Button>
      </div>

      {/* Modern Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {stages.map((st) => {
          const stageClients = clients.filter((c) => c.onboardingStage === st.stage);
          return (
            <div key={st.stage} className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3 flex flex-col min-h-[480px]">
              <div className="flex items-center justify-between pb-3 px-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  {st.title}
                </span>
                <span className="w-5 h-5 rounded-full bg-white text-slate-700 font-mono font-bold text-[11px] flex items-center justify-center border border-slate-200 shadow-2xs">
                  {stageClients.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageClients.map((c) => (
                  <div
                    key={c.id}
                    className={`bg-white border border-slate-200/90 border-t-4 ${st.color} rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all space-y-2 cursor-pointer`}
                    onClick={() => onManageClient(c)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-white"
                        style={{ backgroundColor: c.accentColor || '#6366f1' }}
                      >
                        {c.initials}
                      </div>
                      <span className="font-bold text-slate-900 text-xs truncate leading-tight">{c.name}</span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500">
                      <p className="truncate">Owner: {c.ownerEmail}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-bold text-violet-700">{c.plan}</span>
                        <span className="font-mono text-slate-400">{c.lastActivityTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
