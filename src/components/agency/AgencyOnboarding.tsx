'use client';

import React, { useState } from 'react';
import { AgencyClient } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import {
  GitBranch,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  Palette,
  Settings,
  Building2,
  Mail,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface AgencyOnboardingProps {
  clients: AgencyClient[];
  onOpenAddClient: () => void;
  onManageClient: (client: AgencyClient) => void;
  onUpdateClientStage: (clientId: string, nextStage: AgencyClient['onboardingStage']) => void;
}

export const AgencyOnboarding: React.FC<AgencyOnboardingProps> = ({
  clients,
  onOpenAddClient,
  onManageClient,
  onUpdateClientStage,
}) => {
  const stages: Array<{
    id: AgencyClient['onboardingStage'];
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: 'New Client',
      title: '1. New Client',
      description: 'Account created & invitation sent',
      icon: <Mail className="w-4 h-4" />,
      color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    },
    {
      id: 'Setup',
      title: '2. Setup',
      description: 'Business hours & owner profile',
      icon: <Building2 className="w-4 h-4" />,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      id: 'Branding',
      title: '3. Branding',
      description: 'Logo & white-label colors',
      icon: <Palette className="w-4 h-4" />,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 'Domain',
      title: '4. Domain',
      description: 'Custom FQDN & DNS validation',
      icon: <Globe className="w-4 h-4" />,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'Configuration',
      title: '5. Configuration',
      description: 'AI receptionist & Stripe connect',
      icon: <Settings className="w-4 h-4" />,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 'Live',
      title: '6. Live',
      description: 'Fully active in production',
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  const getNextStage = (current: AgencyClient['onboardingStage']): AgencyClient['onboardingStage'] => {
    const sequence: AgencyClient['onboardingStage'][] = [
      'New Client',
      'Setup',
      'Branding',
      'Domain',
      'Configuration',
      'Live',
    ];
    const idx = sequence.indexOf(current);
    return idx < sequence.length - 1 ? sequence[idx + 1] : 'Live';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Agency Client Onboarding Pipeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono">
              6 Pipeline Stages
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track and advance client businesses through each onboarding phase from initial invitation to live production.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddClient}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs font-bold bg-primary text-white shadow-sm"
        >
          + Add New Client
        </Button>
      </div>

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageClients = clients.filter((c) => c.onboardingStage === stage.id);

          return (
            <div
              key={stage.id}
              className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-3 flex flex-col justify-between min-h-[520px]"
            >
              {/* Stage Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${stage.color}`}>
                    {stage.icon}
                    <span>{stage.title}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {stageClients.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{stage.description}</p>
              </div>

              {/* Client Cards in this stage */}
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5 py-2">
                {stageClients.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-slate-500 border border-dashed border-outline-variant/40 rounded-xl">
                    No clients in this stage
                  </div>
                ) : (
                  stageClients.map((client) => {
                    const isLive = client.onboardingStage === 'Live';
                    const nextStage = getNextStage(client.onboardingStage);

                    return (
                      <div
                        key={client.id}
                        className="p-3.5 rounded-xl bg-[#070b14] border border-outline-variant/60 hover:border-primary/50 transition-all space-y-2 shadow-xs group"
                      >
                        {/* Card Top */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0"
                              style={{ backgroundColor: client.accentColor }}
                            >
                              {client.initials}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-white truncate block group-hover:text-primary transition-colors">
                                {client.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {client.industry}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Progress</span>
                            <span className="font-bold text-slate-300">{client.onboardingProgress}%</span>
                          </div>
                          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                              style={{ width: `${client.onboardingProgress}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between gap-1">
                          <button
                            onClick={() => onManageClient(client)}
                            className="text-[10px] text-slate-400 hover:text-white font-medium"
                          >
                            Details
                          </button>

                          {!isLive && (
                            <button
                              onClick={() => onUpdateClientStage(client.id, nextStage)}
                              className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20"
                            >
                              <span>Next Stage</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          {isLive && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Live
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Stage Summary Footer */}
              <div className="pt-2 border-t border-outline-variant/40 text-[10px] text-slate-500 font-mono text-center">
                {stageClients.length} / {clients.length} Clients
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
