'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { useApp } from '@/context/AppContext';
import { ReceptionistConversation, ConversationState, ReceptionistChannel } from '@/types';
import {
  MessageSquare,
  Search,
  Filter,
  Bot,
  User,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Sliders,
  Calendar,
  XCircle,
  Flame,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const CONVERSATION_STATES: ConversationState[] = [
  'NEW',
  'COLLECTING_INFO',
  'QUALIFYING',
  'READY_TO_BOOK',
  'BOOKING',
  'BOOKED',
  'HANDOFF_REQUIRED',
  'COMPLETED'
];

function ConversationsContent() {
  const router = useRouter();
  const {
    receptionistConversations,
    triggerHandoff,
    resolveHandoff,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  const selectedConv = useMemo(() => {
    return receptionistConversations.find(c => c.id === selectedConvId) || null;
  }, [receptionistConversations, selectedConvId]);

  const filteredConversations = useMemo(() => {
    return receptionistConversations.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.customerName?.toLowerCase().includes(q) || false;
        const matchPhone = c.customerPhone?.toLowerCase().includes(q) || false;
        const matchEmail = c.customerEmail?.toLowerCase().includes(q) || false;
        const matchService = c.serviceRequested?.toLowerCase().includes(q) || false;
        const matchMessages = (c.messages || []).some(m => m.content.toLowerCase().includes(q));
        if (!matchName && !matchPhone && !matchEmail && !matchService && !matchMessages) {
          return false;
        }
      }

      if (stateFilter !== 'ALL' && c.state !== stateFilter) return false;
      if (channelFilter !== 'ALL' && c.channel !== channelFilter) return false;
      if (urgencyFilter !== 'ALL' && c.urgency !== urgencyFilter) return false;

      return true;
    });
  }, [receptionistConversations, searchQuery, stateFilter, channelFilter, urgencyFilter]);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Receptionist Conversations"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'AI Receptionist', href: '/receptionist' },
            { label: 'Conversations' }
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/receptionist/test">
                <Button size="sm" className="gap-1.5 shadow-md shadow-primary/20">
                  <Sparkles className="w-4 h-4" />
                  <span>Test Simulator</span>
                </Button>
              </Link>
            </div>
          }
        />

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/60 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Search conversations by name, phone, email, service or message text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Selectors */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* State Filter */}
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 py-2 text-xs font-semibold text-on-surface"
              >
                <option value="ALL">All States ({receptionistConversations.length})</option>
                {CONVERSATION_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Channel Filter */}
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 py-2 text-xs font-semibold text-on-surface"
              >
                <option value="ALL">All Channels</option>
                <option value="WEB_CHAT">Web Chat</option>
                <option value="SIMULATED">Simulated Test</option>
                <option value="SMS">SMS (Inbound)</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>

              {/* Urgency Filter */}
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 py-2 text-xs font-semibold text-on-surface"
              >
                <option value="ALL">All Urgencies</option>
                <option value="urgent">Urgent / Emergency</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conversations Table (Desktop & Tablet) */}
        <div className="hidden md:block rounded-2xl border border-outline-variant/60 bg-surface-container-lowest overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/50 text-[11px] font-bold text-outline uppercase tracking-wider">
                  <th className="py-3 px-4">Customer Contact</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Service Requested</th>
                  <th className="py-3 px-4">Detected Intent</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Last Message</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-xs">
                {filteredConversations.map((conv) => (
                  <tr
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className="hover:bg-surface-container/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {conv.customerName ? conv.customerName.substring(0, 2).toUpperCase() : 'IN'}
                        </div>
                        <div>
                          <span className="font-bold text-on-surface hover:text-primary transition-colors block">
                            {conv.customerName || 'Anonymous Visitor'}
                          </span>
                          <div className="text-[11px] text-outline mt-0.5 flex items-center gap-1.5">
                            {conv.customerPhone && <span>{conv.customerPhone}</span>}
                            {conv.customerEmail && <span>• {conv.customerEmail}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-surface-container text-[10px] font-bold uppercase text-outline">
                        {conv.channel}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-on-surface">
                      {conv.serviceRequested || 'General Inquiry'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-primary text-xs">
                        {conv.detectedIntent || 'UNKNOWN'}
                      </span>
                      {conv.intentConfidence ? (
                        <span className="text-[10px] text-outline block">
                          {Math.round(conv.intentConfidence * 100)}% conf
                        </span>
                      ) : null}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        conv.state === 'BOOKED' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        conv.state === 'HANDOFF_REQUIRED' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                        conv.state === 'READY_TO_BOOK' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                        'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                      }`}>
                        {conv.state.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        conv.urgency === 'urgent' ? 'bg-error/10 text-error' :
                        conv.urgency === 'high' ? 'bg-amber-500/10 text-amber-600' :
                        'text-outline'
                      }`}>
                        {conv.urgency}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-outline text-[11px]">
                      {conv.createdAt}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-outline ml-auto" />
                    </td>
                  </tr>
                ))}

                {filteredConversations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-outline">
                      No conversations found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-3">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              className="p-4 rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm space-y-2 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-sm text-on-surface">
                  {conv.customerName || 'Anonymous Visitor'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container text-outline">
                  {conv.channel}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">{conv.serviceRequested || 'General Inquiry'}</p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-outline-variant/30">
                <span className="font-bold text-primary">{conv.state}</span>
                <span className="text-outline text-[11px]">{conv.createdAt}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Deep Transcript & Handoff Drawer */}
        <Drawer
          isOpen={!!selectedConv}
          onClose={() => setSelectedConvId(null)}
          title={selectedConv?.customerName || 'Conversation Transcript'}
          size="lg"
        >
          {selectedConv && (
            <div className="space-y-6 pb-6 text-xs">
              {/* Header card with extracted customer metadata */}
              <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">{selectedConv.customerName || 'Anonymous Contact'}</h3>
                    <p className="text-xs text-outline">{selectedConv.channel} • Initiated {selectedConv.createdAt}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedConv.state === 'BOOKED' ? 'bg-emerald-500/10 text-emerald-600' :
                    selectedConv.state === 'HANDOFF_REQUIRED' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {selectedConv.state}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-outline-variant/40 text-[11px]">
                  <div>
                    <span className="text-outline block">Phone</span>
                    <span className="font-bold">{selectedConv.customerPhone || 'Not captured'}</span>
                  </div>
                  <div>
                    <span className="text-outline block">Email</span>
                    <span className="font-bold">{selectedConv.customerEmail || 'Not captured'}</span>
                  </div>
                  <div>
                    <span className="text-outline block">Service</span>
                    <span className="font-bold text-primary">{selectedConv.serviceRequested || 'General'}</span>
                  </div>
                </div>

                {selectedConv.leadId && (
                  <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Synced to CRM Lead ({selectedConv.leadId})
                    </span>
                    <Link href={`/leads?leadId=${selectedConv.leadId}`} className="text-primary font-bold hover:underline text-xs">
                      Open Lead &rarr;
                    </Link>
                  </div>
                )}
              </div>

              {/* Message transcript */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-outline">Full Conversation Transcript</h4>
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {(selectedConv.messages || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-2xl space-y-1.5 ${
                        msg.senderType === 'CUSTOMER'
                          ? 'bg-surface-container-high border border-outline-variant/60 ml-6 text-on-surface'
                          : msg.senderType === 'AI'
                          ? 'bg-primary/10 border border-primary/20 text-on-surface mr-6'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-outline">
                        <span className="flex items-center gap-1">
                          {msg.senderType === 'AI' && <Bot className="w-3 h-3 text-primary" />}
                          {msg.senderType === 'CUSTOMER' && <User className="w-3 h-3" />}
                          {msg.senderType}
                        </span>
                        <span>{msg.createdAt}</span>
                      </div>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                {selectedConv.handoffRequired ? (
                  <Button variant="primary" onClick={() => resolveHandoff(selectedConv.id)}>
                    Mark Handoff Resolved
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => triggerHandoff(selectedConv.id, 'Operator escalation')}>
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

export default function ReceptionistConversationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-outline">Loading Conversations...</div>}>
      <ConversationsContent />
    </Suspense>
  );
}
