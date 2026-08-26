'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Drawer } from '@/components/ui/Drawer';
import { useApp } from '@/context/AppContext';
import { ReceptionistConversation, ConversationState } from '@/types';
import {
  Bot,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  ArrowRight,
  Settings,
  MessageSquare,
  UserCheck,
  Wrench,
  ChevronRight,
  Building2,
  RefreshCw,
  Sliders
} from 'lucide-react';

function ReceptionistContent() {
  const router = useRouter();
  const {
    receptionistSettings,
    receptionistServices,
    receptionistConversations,
    updateReceptionistSettings,
    activeConversationsCount,
    todayConversationsCount,
    receptionistHandoffsCount,
    receptionistLeadsCreatedCount,
    receptionistBookingsCount,
    triggerHandoff,
    resolveHandoff,
  } = useApp();

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  const selectedConv = useMemo(() => {
    return receptionistConversations.find(c => c.id === selectedConvId) || null;
  }, [receptionistConversations, selectedConvId]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="AI Receptionist"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'AI Receptionist' }
          ]}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/receptionist/conversations">
                <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>Conversations</span>
                </Button>
              </Link>
              <Link href="/settings/receptionist">
                <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
                  <Sliders className="w-4 h-4 text-outline" />
                  <span>Configure</span>
                </Button>
              </Link>
              <Link href="/receptionist/test">
                <Button size="sm" className="gap-1.5 shadow-md shadow-primary/20 bg-primary text-on-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>Live Simulator</span>
                </Button>
              </Link>
            </div>
          }
        />

        {/* Live Receptionist Status Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container border border-outline-variant/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              receptionistSettings.enabled 
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
            }`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-sm sm:text-base text-on-surface">
                  Receptionist Engine is {receptionistSettings.enabled ? 'Active & Answering' : 'Paused'}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  receptionistSettings.enabled ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-500/15 text-slate-600'
                }`}>
                  {receptionistSettings.enabled ? 'Online' : 'Standby'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                  Tone: {receptionistSettings.tone}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                Greeting: &ldquo;{receptionistSettings.greeting}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant={receptionistSettings.enabled ? 'outline' : 'primary'}
              size="sm"
              onClick={() => updateReceptionistSettings({ enabled: !receptionistSettings.enabled })}
            >
              {receptionistSettings.enabled ? 'Pause Receptionist' : 'Activate Receptionist'}
            </Button>
          </div>
        </div>

        {/* Receptionist Metric Cockpit Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            label="Inbound Inquiries"
            value={todayConversationsCount}
            subtext="Total conversations"
            icon={<MessageSquare className="w-5 h-5 text-primary" />}
            change={{ value: `${activeConversationsCount} Active`, isPositive: true }}
          />

          <StatCard
            label="Leads Qualified"
            value={receptionistLeadsCreatedCount}
            subtext="Sent to CRM pipeline"
            icon={<UserCheck className="w-5 h-5 text-emerald-500" />}
            change={{ value: 'Auto-Synced', isPositive: true }}
          />

          <StatCard
            label="Bookings Created"
            value={receptionistBookingsCount}
            subtext="Scheduled visits"
            icon={<Calendar className="w-5 h-5 text-blue-500" />}
          />

          <StatCard
            label="Human Handoffs"
            value={receptionistHandoffsCount}
            subtext="Escalated to team"
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          />

          <StatCard
            label="Avg Response Time"
            value="1.2s"
            subtext="Sub-second streaming"
            icon={<Clock className="w-5 h-5 text-indigo-500" />}
          />
        </div>

        {/* Two-Column Grid: Recent Inbound Conversations & Knowledge Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Recent Conversations Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Recent Receptionist Conversations</h3>
                  <p className="text-xs text-outline">Real-time incoming customer inquiries & automated qualifications</p>
                </div>
                <Link href="/receptionist/conversations" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  View All ({receptionistConversations.length})
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-outline-variant/40">
                {receptionistConversations.slice(0, 5).map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className="py-3.5 px-2.5 rounded-xl hover:bg-surface-container/50 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {conv.customerName ? conv.customerName.substring(0, 2).toUpperCase() : 'IN'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                            {conv.customerName || 'Anonymous Web Visitor'}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-surface-container text-outline uppercase">
                            {conv.channel}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                          {conv.serviceRequested ? `Requested: ${conv.serviceRequested}` : 'General customer inquiry'}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-outline mt-0.5">
                          {conv.customerPhone && <span>{conv.customerPhone}</span>}
                          <span>•</span>
                          <span>{conv.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        conv.state === 'BOOKED' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        conv.state === 'HANDOFF_REQUIRED' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                        conv.state === 'READY_TO_BOOK' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                        'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                      }`}>
                        {conv.state.replace('_', ' ')}
                      </span>
                      <ChevronRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}

                {receptionistConversations.length === 0 && (
                  <div className="py-12 text-center text-outline text-xs space-y-2">
                    <MessageSquare className="w-8 h-8 opacity-40 mx-auto" />
                    <p className="font-semibold">No receptionist conversations recorded yet.</p>
                    <Link href="/receptionist/test">
                      <Button size="sm" variant="outline">Launch Live Test Chat</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Service Knowledge Matrix & Safety Guardrails */}
          <div className="space-y-4">
            {/* Service Knowledge Catalog Summary */}
            <div className="p-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-primary" /> Service Catalog Knowledge
                </h3>
                <Link href="/settings/receptionist" className="text-[11px] text-primary font-bold hover:underline">
                  Manage
                </Link>
              </div>

              <div className="space-y-2">
                {receptionistServices.map((svc) => (
                  <div key={svc.id} className="p-2.5 rounded-xl border border-outline-variant/50 bg-surface-container/30 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-on-surface">{svc.name}</span>
                      {svc.emergencyAvailable && (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> 24/7
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-outline line-clamp-1">{svc.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant pt-1 border-t border-outline-variant/30">
                      <span>Duration: {svc.typicalDurationMinutes}m</span>
                      <span className="font-bold text-primary">{svc.basePrice ? `$${svc.basePrice} base` : 'Free Quote'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Safety Boundary Audit */}
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>AI Safety & Financial Boundary Verified</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                The receptionist operates strictly in conversational qualification mode. Financial ledgers, invoice adjustments, fee waivers, and tenant permissions are immutable and require authorized staff verification.
              </p>
            </div>
          </div>
        </div>

        {/* Conversation Detail Drawer */}
        <Drawer
          isOpen={!!selectedConv}
          onClose={() => setSelectedConvId(null)}
          title={selectedConv?.customerName || 'Conversation Transcript'}
          size="md"
        >
          {selectedConv && (
            <div className="space-y-5 pb-6">
              {/* Summary metadata card */}
              <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface">State: {selectedConv.state}</span>
                  <span className="text-[10px] text-outline">{selectedConv.channel}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/40">
                  <div>
                    <span className="text-outline block">Service</span>
                    <span className="font-semibold">{selectedConv.serviceRequested || 'General'}</span>
                  </div>
                  <div>
                    <span className="text-outline block">Detected Intent</span>
                    <span className="font-semibold text-primary">{selectedConv.detectedIntent || 'UNKNOWN'}</span>
                  </div>
                </div>

                {selectedConv.handoffRequired && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-semibold flex items-center gap-1.5 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Handoff: {selectedConv.handoffReason || 'Escalated to human staff'}</span>
                  </div>
                )}
              </div>

              {/* Message transcript */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-outline">Message History</h4>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {(selectedConv.messages || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        msg.senderType === 'CUSTOMER'
                          ? 'bg-surface-container border border-outline-variant/60 ml-4'
                          : msg.senderType === 'AI'
                          ? 'bg-primary/10 border border-primary/20 text-on-surface mr-4'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-outline">
                        <span>{msg.senderType}</span>
                        <span>{msg.createdAt}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant">
                {selectedConv.handoffRequired ? (
                  <Button
                    variant="primary"
                    onClick={() => resolveHandoff(selectedConv.id)}
                  >
                    Mark Handoff Resolved
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => triggerHandoff(selectedConv.id, 'Manual operator intervention')}
                  >
                    Escalate to Human Agent
                  </Button>
                )}
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </AppShell>
  );
}

export default function ReceptionistPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-outline">Loading AI Receptionist...</div>}>
      <ReceptionistContent />
    </Suspense>
  );
}
