'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/context/AppContext';
import { Lead, LeadStatus, LeadPriority, LeadSource } from '@/types';
import { calculateLeadScore } from '@/lib/crm/scoring';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Phone, 
  Mail, 
  FileText, 
  UserCheck, 
  CheckCircle2, 
  Sparkles, 
  Building2,
  Trash2,
  Calendar,
  Flame,
  Zap,
  Snowflake,
  Filter,
  UserPlus,
  Wrench,
  Clock,
  ArrowRight
} from 'lucide-react';

const PIPELINE_COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'NEW', label: 'New Leads', color: 'border-t-primary' },
  { id: 'CONTACTED', label: 'Contacted', color: 'border-t-sky-500' },
  { id: 'QUALIFIED', label: 'Qualified', color: 'border-t-indigo-500' },
  { id: 'ESTIMATE_SENT', label: 'Estimate Sent', color: 'border-t-amber-500' },
  { id: 'BOOKED', label: 'Booked', color: 'border-t-teal-500' },
  { id: 'WON', label: 'Won / Closed', color: 'border-t-tertiary' },
  { id: 'LOST', label: 'Lost', color: 'border-t-outline' },
];

const LEAD_SOURCES: LeadSource[] = [
  'Website',
  'Phone Call',
  'Google',
  'Referral',
  'Angi',
  'Yelp',
  'Facebook',
  'Instagram',
  'Thumbtack',
  'Direct',
  'Manual',
  'Import',
  'Other'
];

const TEAM_MEMBERS = [
  { id: 'user-marcus', name: 'Marcus Vance' },
  { id: 'user-sarah', name: 'Sarah Jenkins' },
  { id: 'user-leo', name: 'Leo Martinez' },
];

function PipelineContent() {
  const router = useRouter();
  const { 
    leads, 
    appointments,
    jobs,
    invoices,
    addLead, 
    updateLeadStatus, 
    assignLead,
    addLeadNote,
    deleteLead, 
    convertLeadToCustomer,
    pipelineValue,
    conversionRate
  } = useApp();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Drag and Drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);

  // Drawer & Modal states
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [initialStatusForNewLead, setInitialStatusForNewLead] = useState<LeadStatus>('NEW');

  // New lead form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('Website');
  const [serviceRequested, setServiceRequested] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number>(2500);
  const [priority, setPriority] = useState<LeadPriority>('medium');
  const [assignedUserName, setAssignedUserName] = useState('Marcus Vance');

  const selectedLead = useMemo(() => {
    return leads.find(l => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = l.name.toLowerCase().includes(q);
        const matchCompany = l.company?.toLowerCase().includes(q) || false;
        const matchService = l.serviceRequested.toLowerCase().includes(q);
        const matchPhone = l.phone?.toLowerCase().includes(q) || false;
        if (!matchName && !matchCompany && !matchService && !matchPhone) return false;
      }
      if (assigneeFilter !== 'ALL') {
        if (assigneeFilter === 'UNASSIGNED' && (l.assignedUserName || l.assignedUserId)) return false;
        if (assigneeFilter !== 'UNASSIGNED' && l.assignedUserName !== assigneeFilter) return false;
      }
      if (sourceFilter !== 'ALL' && l.source !== sourceFilter) return false;
      if (priorityFilter !== 'ALL' && l.priority !== priorityFilter) return false;
      return true;
    });
  }, [leads, searchQuery, assigneeFilter, sourceFilter, priorityFilter]);

  const leadsByStatus = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      NEW: [],
      CONTACTED: [],
      QUALIFIED: [],
      ESTIMATE_SENT: [],
      BOOKED: [],
      WON: [],
      LOST: []
    };

    filteredLeads.forEach(lead => {
      if (map[lead.status]) {
        map[lead.status].push(lead);
      } else {
        map.NEW.push(lead);
      }
    });

    return map;
  }, [filteredLeads]);

  const getNextStage = (current: LeadStatus): LeadStatus | null => {
    const order: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'ESTIMATE_SENT', 'BOOKED', 'WON'];
    const idx = order.indexOf(current);
    if (idx !== -1 && idx < order.length - 1) {
      return order[idx + 1];
    }
    return null;
  };

  const getPrevStage = (current: LeadStatus): LeadStatus | null => {
    const order: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'ESTIMATE_SENT', 'BOOKED', 'WON'];
    const idx = order.indexOf(current);
    if (idx > 0) {
      return order[idx - 1];
    }
    return null;
  };

  const handleOpenAddModal = (status: LeadStatus = 'NEW') => {
    setInitialStatusForNewLead(status);
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setSource('Website');
    setServiceRequested('');
    setEstimatedValue(2500);
    setPriority('medium');
    setAssignedUserName('Marcus Vance');
    setIsAddModalOpen(true);
  };

  const handleCreateLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assignedMember = TEAM_MEMBERS.find(m => m.name === assignedUserName);

    await addLead({
      name,
      company: company || undefined,
      phone,
      email,
      source,
      serviceRequested: serviceRequested || 'Standard Service Call',
      status: initialStatusForNewLead,
      priority,
      estimatedValue: Number(estimatedValue) || 0,
      assignedUserId: assignedMember?.id,
      assignedUserName: assignedMember?.name,
    });

    setIsAddModalOpen(false);
  };

  // Drag and Drop handlers
  const handleDragStart = (leadId: string) => {
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, colId: LeadStatus) => {
    e.preventDefault();
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggedLeadId) return;

    const lead = leads.find(l => l.id === draggedLeadId);
    if (lead && lead.status !== targetStatus) {
      await updateLeadStatus(draggedLeadId, targetStatus);
    }
    setDraggedLeadId(null);
  };

  return (
    <AppShell title="Pipeline Kanban">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <PageHeader
          title="Sales & Service Pipeline"
          subtitle={`Total Open Opportunity Value: $${pipelineValue.toLocaleString()} • Win Rate: ${conversionRate}%`}
          actions={
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href="/leads"
                className="px-3.5 py-2 rounded-xl bg-surface border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors shadow-xs"
              >
                Table View
              </Link>

              <Button
                variant="primary"
                size="md"
                onClick={() => handleOpenAddModal('NEW')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                + New Lead
              </Button>
            </div>
          }
        />

        {/* Pipeline Filter Bar */}
        <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/60 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads, company, or service in pipeline..."
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 py-2 text-xs font-medium text-on-surface"
            >
              <option value="ALL">All Assignees</option>
              {TEAM_MEMBERS.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
              <option value="UNASSIGNED">Unassigned</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 py-2 text-xs font-medium text-on-surface"
            >
              <option value="ALL">All Sources</option>
              {LEAD_SOURCES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 py-2 text-xs font-medium text-on-surface"
            >
              <option value="ALL">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Kanban Board Columns Horizontal Scroll */}
        <div className="overflow-x-auto pb-6">
          <div className="flex items-start gap-4 min-w-[1400px]">
            {PIPELINE_COLUMNS.map((col) => {
              const columnLeads = leadsByStatus[col.id] || [];
              const columnValue = columnLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
              const isOver = dragOverCol === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`w-72 rounded-2xl border transition-all flex flex-col max-h-[calc(100vh-220px)] shadow-2xs ${
                    isOver 
                      ? 'bg-primary/5 border-primary ring-2 ring-primary/20' 
                      : 'bg-surface-container-low/70 border-outline-variant/60'
                  }`}
                >
                  {/* Column Header */}
                  <div className={`p-3.5 border-t-4 ${col.color} bg-surface rounded-t-2xl border-b border-outline-variant/60 flex items-center justify-between`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                          {col.label}
                        </h3>
                        <span className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface text-[11px] font-bold flex items-center justify-center">
                          {columnLeads.length}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-on-surface-variant block mt-0.5">
                        ${columnValue.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(col.id)}
                      className="p-1 rounded-lg text-outline hover:text-primary hover:bg-surface-container-high transition-colors"
                      title="Add lead to this stage"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cards Container */}
                  <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1">
                    {columnLeads.length === 0 ? (
                      <div className="py-8 text-center text-xs text-outline italic">
                        Drag leads here or click + to add
                      </div>
                    ) : (
                      columnLeads.map((lead) => {
                        const nextStage = getNextStage(lead.status);
                        const prevStage = getPrevStage(lead.status);
                        const scoreBreakdown = calculateLeadScore(lead);

                        return (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={() => handleDragStart(lead.id)}
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="p-3.5 rounded-xl bg-surface border border-outline-variant/80 hover:border-primary/50 shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing group space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                                  {lead.name}
                                </h4>
                                {lead.company && (
                                  <span className="text-[11px] text-outline flex items-center gap-1 font-medium">
                                    <Building2 className="w-3 h-3" /> {lead.company}
                                  </span>
                                )}
                              </div>
                              <Badge priority={lead.priority} size="sm" />
                            </div>

                            <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                              {lead.serviceRequested || 'Service Request'}
                            </p>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-outline-variant/40 text-xs">
                              <span className="font-extrabold text-on-surface">
                                ${lead.estimatedValue.toLocaleString()}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  scoreBreakdown.grade === 'HOT' ? 'bg-amber-500/10 text-amber-600' :
                                  scoreBreakdown.grade === 'WARM' ? 'bg-blue-500/10 text-blue-600' :
                                  'bg-slate-500/10 text-slate-600'
                                }`}>
                                  {scoreBreakdown.totalScore}
                                </span>
                                <span className="text-[10px] text-outline">{lead.source}</span>
                              </div>
                            </div>

                            {lead.assignedUserName && (
                              <div className="text-[10px] text-outline flex items-center gap-1">
                                <span>Assignee:</span>
                                <span className="font-semibold text-on-surface">{lead.assignedUserName}</span>
                              </div>
                            )}

                            {/* Stage Advancement Quick Controls */}
                            <div 
                              className="flex items-center justify-between gap-1 pt-2 border-t border-outline-variant/30 text-[10px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {prevStage ? (
                                <button
                                  type="button"
                                  onClick={() => updateLeadStatus(lead.id, prevStage)}
                                  className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high font-semibold flex items-center gap-0.5"
                                  title={`Move back to ${prevStage}`}
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                  <span>Back</span>
                                </button>
                              ) : <span />}

                              {nextStage ? (
                                <button
                                  type="button"
                                  onClick={() => updateLeadStatus(lead.id, nextStage)}
                                  className="px-2 py-1 rounded-lg bg-primary-fixed/30 hover:bg-primary-fixed/60 text-primary font-bold flex items-center gap-0.5"
                                  title={`Advance to ${nextStage}`}
                                >
                                  <span>Advance</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="text-tertiary font-bold flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Completed</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lead Quick Drawer */}
      <Drawer
        isOpen={!!selectedLead}
        onClose={() => setSelectedLeadId(null)}
        title={selectedLead?.name || 'Lead Pipeline Detail'}
        size="md"
      >
        {selectedLead && (
          <div className="space-y-5 pb-6">
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                  Current Stage
                </span>
                <div className="mt-1">
                  <Badge leadStatus={selectedLead.status} size="md" />
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                  Est. Deal Value
                </span>
                <span className="text-xl font-extrabold text-on-surface">
                  ${selectedLead.estimatedValue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Change Stage Button Matrix */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                Move Stage:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {(['NEW', 'CONTACTED', 'QUALIFIED', 'ESTIMATE_SENT', 'BOOKED', 'WON', 'LOST'] as LeadStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateLeadStatus(selectedLead.id, st)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all truncate text-center ${
                      selectedLead.status === st
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant space-y-2 text-xs">
              <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">Contact & Service Info</h4>
              <p><strong className="text-on-surface">Phone:</strong> {selectedLead.phone || 'None'}</p>
              <p><strong className="text-on-surface">Email:</strong> {selectedLead.email || 'None'}</p>
              <p><strong className="text-on-surface">Service:</strong> {selectedLead.serviceRequested}</p>
              <p><strong className="text-on-surface">Source:</strong> {selectedLead.source}</p>
              <p><strong className="text-on-surface">Assignee:</strong> {selectedLead.assignedUserName || 'Unassigned'}</p>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant">
              <Button
                variant="primary"
                onClick={() => {
                  convertLeadToCustomer(selectedLead.id);
                  setSelectedLeadId(null);
                }}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Convert to Customer Contact
              </Button>
              <Link href={`/leads?leadId=${selectedLead.id}`}>
                <Button variant="outline" className="w-full">
                  Open Complete Lead Console
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Drawer>

      {/* New Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add Lead to Pipeline (${initialStatusForNewLead})`}
        maxWidth="md"
      >
        <form onSubmit={handleCreateLeadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Customer Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sandra Bullock"
              required
            />
            <Input
              label="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Austin Commercial Services"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Acquisition Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-xs text-on-surface"
              >
                {LEAD_SOURCES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-xs text-on-surface"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Assign To</label>
              <select
                value={assignedUserName}
                onChange={(e) => setAssignedUserName(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-xs text-on-surface"
              >
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Service Requested"
              value={serviceRequested}
              onChange={(e) => setServiceRequested(e.target.value)}
              placeholder="e.g. Commercial HVAC Diagnostics"
            />
            <Input
              label="Estimated Value ($)"
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Lead
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

export default function PipelinePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-outline">Loading Pipeline...</div>}>
      <PipelineContent />
    </Suspense>
  );
}
