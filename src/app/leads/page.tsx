'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { StatCard } from '@/components/ui/StatCard';
import { useApp } from '@/context/AppContext';
import { Lead, LeadStatus, LeadPriority, LeadSource, Customer } from '@/types';
import { calculateLeadScore } from '@/lib/crm/scoring';
import { detectDuplicates, DuplicateMatch } from '@/lib/crm/duplicates';
import { 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Kanban, 
  UserCheck, 
  Sparkles, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Building2,
  Trash2,
  Edit3,
  Flame,
  Zap,
  Snowflake,
  AlertTriangle,
  UserPlus,
  Wrench,
  DollarSign,
  MessageSquare,
  ChevronRight,
  XCircle,
  Users,
  Layers,
  ArrowUpDown
} from 'lucide-react';

const LEAD_STATUSES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'ESTIMATE_SENT',
  'BOOKED',
  'WON',
  'LOST'
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

function LeadsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    leads, 
    customers,
    appointments,
    jobs,
    invoices,
    addLead, 
    updateLead,
    updateLeadStatus, 
    assignLead,
    addLeadActivity,
    addLeadNote,
    updateLeadNote,
    deleteLeadNote,
    bulkUpdateLeadStatus,
    bulkAssignLeads,
    bulkDeleteLeads,
    deleteLead, 
    convertLeadToCustomer,
    newLeadsCount,
    contactedLeadsCount,
    qualifiedLeadsCount,
    estimateSentCount,
    bookedLeadsCount,
    wonLeadsCount,
    lostLeadsCount,
    pipelineValue,
    conversionRate,
    averageLeadScore
  } = useApp();

  // Modals and Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(searchParams.get('action') === 'create');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(searchParams.get('leadId') || null);
  const [detailTab, setDetailTab] = useState<'overview' | 'notes' | 'activity' | 'linked'>('overview');

  // Search & Multi-Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [scoreFilter, setScoreFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'created_desc' | 'created_asc' | 'score_desc' | 'value_desc' | 'name_asc'>('created_desc');

  // Bulk Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Form State for Add / Edit Lead
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('Website');
  const [serviceRequested, setServiceRequested] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number>(1500);
  const [priority, setPriority] = useState<LeadPriority>('medium');
  const [assignedUserName, setAssignedUserName] = useState<string>('Marcus Vance');
  const [notes, setNotes] = useState('');

  // Note Drawer State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  // Conversion Duplicate Match State
  const [duplicateCheck, setDuplicateCheck] = useState<{ hasDuplicate: boolean; matches: DuplicateMatch[] }>({
    hasDuplicate: false,
    matches: []
  });
  const [selectedLinkCustomerId, setSelectedLinkCustomerId] = useState<string | null>(null);

  const selectedLead = useMemo(() => {
    return leads.find(l => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Filtered and Sorted Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = lead.name.toLowerCase().includes(q);
        const matchCompany = lead.company?.toLowerCase().includes(q) || false;
        const matchEmail = lead.email?.toLowerCase().includes(q) || false;
        const matchPhone = lead.phone?.toLowerCase().includes(q) || false;
        const matchService = lead.serviceRequested?.toLowerCase().includes(q) || false;
        if (!matchName && !matchCompany && !matchEmail && !matchPhone && !matchService) {
          return false;
        }
      }

      // 2. Status
      if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;

      // 3. Source
      if (sourceFilter !== 'ALL' && lead.source !== sourceFilter) return false;

      // 4. Assignee
      if (assigneeFilter !== 'ALL') {
        if (assigneeFilter === 'UNASSIGNED' && (lead.assignedUserName || lead.assignedUserId)) return false;
        if (assigneeFilter !== 'UNASSIGNED' && lead.assignedUserName !== assigneeFilter) return false;
      }

      // 5. Priority
      if (priorityFilter !== 'ALL' && lead.priority !== priorityFilter) return false;

      // 6. Score
      if (scoreFilter !== 'ALL') {
        const s = lead.score ?? calculateLeadScore(lead).totalScore;
        if (scoreFilter === 'HOT' && s < 75) return false;
        if (scoreFilter === 'WARM' && (s < 45 || s >= 75)) return false;
        if (scoreFilter === 'COLD' && s >= 45) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'created_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'created_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'score_desc') {
        const sA = a.score ?? calculateLeadScore(a).totalScore;
        const sB = b.score ?? calculateLeadScore(b).totalScore;
        return sB - sA;
      }
      if (sortBy === 'value_desc') {
        return (b.estimatedValue || 0) - (a.estimatedValue || 0);
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [leads, searchQuery, statusFilter, sourceFilter, assigneeFilter, priorityFilter, scoreFilter, sortBy]);

  // Handle Open Create Modal
  const handleOpenCreateModal = () => {
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setSource('Website');
    setServiceRequested('');
    setEstimatedValue(1500);
    setPriority('medium');
    setAssignedUserName('Marcus Vance');
    setNotes('');
    setIsAddModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEditModal = (lead: Lead) => {
    setName(lead.name);
    setCompany(lead.company || '');
    setPhone(lead.phone || '');
    setEmail(lead.email || '');
    setSource(lead.source);
    setServiceRequested(lead.serviceRequested || '');
    setEstimatedValue(lead.estimatedValue || 0);
    setPriority(lead.priority);
    setAssignedUserName(lead.assignedUserName || 'Marcus Vance');
    setNotes(lead.notes || '');
    setIsEditModalOpen(true);
  };

  // Submit Create Lead
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
      status: 'NEW',
      priority,
      estimatedValue: Number(estimatedValue) || 0,
      assignedUserId: assignedMember?.id,
      assignedUserName: assignedMember?.name,
      notes,
    });

    setIsAddModalOpen(false);
  };

  // Submit Edit Lead
  const handleEditLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !name.trim()) return;

    const assignedMember = TEAM_MEMBERS.find(m => m.name === assignedUserName);

    await updateLead({
      ...selectedLead,
      name,
      company: company || undefined,
      phone,
      email,
      source,
      serviceRequested: serviceRequested || 'Standard Service Call',
      priority,
      estimatedValue: Number(estimatedValue) || 0,
      assignedUserId: assignedMember?.id,
      assignedUserName: assignedMember?.name,
      notes,
    });

    setIsEditModalOpen(false);
  };

  // Open Convert Modal with Duplicate Check
  const handleOpenConvertModal = (lead: Lead) => {
    const dupeResult = detectDuplicates(
      { email: lead.email, phone: lead.phone, name: lead.name, company: lead.company },
      customers,
      leads
    );
    setDuplicateCheck(dupeResult);
    if (dupeResult.matches.length > 0) {
      setSelectedLinkCustomerId(dupeResult.matches[0].id);
    } else {
      setSelectedLinkCustomerId(null);
    }
    setIsConvertModalOpen(true);
  };

  // Submit Convert to Contact
  const handleConvertSubmit = async (createNew: boolean) => {
    if (!selectedLead) return;

    await convertLeadToCustomer(
      selectedLead.id,
      createNew,
      !createNew && selectedLinkCustomerId ? selectedLinkCustomerId : undefined
    );

    setIsConvertModalOpen(false);
  };

  // Note creation inside drawer
  const handleCreateNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !selectedLeadId) return;

    await addLeadNote(selectedLeadId, newNoteContent);
    setNewNoteContent('');
  };

  // Select all toggle
  const handleToggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Linked items for selected lead
  const linkedAppointments = useMemo(() => {
    if (!selectedLeadId) return [];
    return appointments.filter(a => a.leadId === selectedLeadId || (selectedLead?.name && a.customerName.toLowerCase().includes(selectedLead.name.toLowerCase())));
  }, [appointments, selectedLeadId, selectedLead]);

  const linkedJobs = useMemo(() => {
    if (!selectedLeadId) return [];
    return jobs.filter(j => j.leadId === selectedLeadId || (selectedLead?.name && j.customerName.toLowerCase().includes(selectedLead.name.toLowerCase())));
  }, [jobs, selectedLeadId, selectedLead]);

  const linkedInvoices = useMemo(() => {
    if (!selectedLead) return [];
    return invoices.filter(i => 
      (selectedLead.customerId && i.customerId === selectedLead.customerId) ||
      i.customerName.toLowerCase().includes(selectedLead.name.toLowerCase())
    );
  }, [invoices, selectedLead]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Leads & Inbound Inquiries"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'CRM Leads' }
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/pipeline">
                <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
                  <Kanban className="w-4 h-4 text-primary" />
                  <span>Kanban Pipeline</span>
                </Button>
              </Link>
              <Button 
                onClick={handleOpenCreateModal}
                size="sm" 
                className="gap-1.5 shadow-md shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Lead</span>
              </Button>
            </div>
          }
        />

        {/* CRM Metric Cockpit Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Inbound Leads"
            value={leads.length}
            subtext={`${newLeadsCount} new inquiry${newLeadsCount === 1 ? '' : 'ies'}`}
            icon={<Sparkles className="w-5 h-5 text-primary" />}
            change={{ value: `${newLeadsCount} New`, isPositive: true }}
          />

          <StatCard
            label="Qualified Pipeline"
            value={qualifiedLeadsCount + estimateSentCount + bookedLeadsCount}
            subtext={`$${pipelineValue.toLocaleString()} estimated value`}
            icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
            change={{ value: `${bookedLeadsCount} Booked`, isPositive: true }}
          />

          <StatCard
            label="Avg Lead Quality"
            value={`${averageLeadScore}/100`}
            subtext={averageLeadScore >= 75 ? '🔥 High intent leads' : '⚡ Warm inbound leads'}
            icon={<Flame className="w-5 h-5 text-amber-500" />}
          />

          <StatCard
            label="Conversion Rate"
            value={`${conversionRate}%`}
            subtext={`${wonLeadsCount} won vs ${lostLeadsCount} lost`}
            icon={<UserCheck className="w-5 h-5 text-indigo-500" />}
            change={{ value: `${wonLeadsCount} Converted`, isPositive: true }}
          />
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/60 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Search leads by name, company, phone, email, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
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

            {/* Quick Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-outline shrink-0 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="created_desc">Newest First</option>
                <option value="created_asc">Oldest First</option>
                <option value="score_desc">Highest Lead Score</option>
                <option value="value_desc">Highest Deal Value</option>
                <option value="name_asc">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Multi-Filter Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-outline-variant/40 text-xs">
            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-1.5 text-xs text-on-surface"
              >
                <option value="ALL">All Statuses ({leads.length})</option>
                {LEAD_STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s} ({leads.filter(l => l.status === s).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Acquisition Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-1.5 text-xs text-on-surface"
              >
                <option value="ALL">All Sources</option>
                {LEAD_SOURCES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Assigned Team</label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-1.5 text-xs text-on-surface"
              >
                <option value="ALL">All Assignees</option>
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
                <option value="UNASSIGNED">Unassigned</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-1.5 text-xs text-on-surface"
              >
                <option value="ALL">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Quality Score Filter */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Quality Rating</label>
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-1.5 text-xs text-on-surface"
              >
                <option value="ALL">All Scores</option>
                <option value="HOT">🔥 Hot (75–100)</option>
                <option value="WARM">⚡ Warm (45–74)</option>
                <option value="COLD">❄️ Cold (&lt;45)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Floating Bulk Action Toolbar */}
        {selectedLeadIds.length > 0 && (
          <div className="p-3 rounded-2xl bg-primary text-on-primary flex flex-wrap items-center justify-between gap-3 shadow-xl animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm px-2 py-0.5 rounded-full bg-white/20">
                {selectedLeadIds.length}
              </span>
              <span className="text-xs sm:text-sm font-semibold">
                lead{selectedLeadIds.length === 1 ? '' : 's'} selected
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Bulk Status Dropdown */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    bulkUpdateLeadStatus(selectedLeadIds, e.target.value as LeadStatus);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-white/20 focus:outline-none cursor-pointer"
              >
                <option value="" disabled className="text-black">Change Status...</option>
                {LEAD_STATUSES.map(s => (
                  <option key={s} value={s} className="text-black">{s}</option>
                ))}
              </select>

              {/* Bulk Assign Dropdown */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const member = TEAM_MEMBERS.find(m => m.id === e.target.value);
                    bulkAssignLeads(selectedLeadIds, member?.id || null, member?.name || null);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-white/20 focus:outline-none cursor-pointer"
              >
                <option value="" disabled className="text-black">Assign to...</option>
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.id} className="text-black">{m.name}</option>
                ))}
                <option value="unassign" className="text-black">Unassign</option>
              </select>

              {/* Bulk Delete */}
              <button
                onClick={() => setIsBulkDeleteConfirmOpen(true)}
                className="px-2.5 py-1.5 bg-error/80 hover:bg-error text-on-error rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setSelectedLeadIds([])}
                className="text-xs text-white/80 hover:text-white underline ml-2"
              >
                Deselect
              </button>
            </div>
          </div>
        )}

        {/* Leads Table View (Desktop & Tablet) */}
        <div className="hidden md:block rounded-2xl border border-outline-variant/60 bg-surface-container-lowest overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/50 text-[11px] font-bold text-outline uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleToggleSelectAll}
                      className="rounded text-primary focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Lead Name & Company</th>
                  <th className="py-3 px-4">Service & Source</th>
                  <th className="py-3 px-4">Quality Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Est. Value</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-xs">
                {filteredLeads.map((lead) => {
                  const scoreBreakdown = calculateLeadScore(lead);
                  const isSelected = selectedLeadIds.includes(lead.id);

                  return (
                    <tr 
                      key={lead.id}
                      className={`hover:bg-surface-container/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(lead.id)}
                          className="rounded text-primary focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div 
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="cursor-pointer group flex items-start gap-2.5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {lead.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-on-surface group-hover:text-primary transition-colors block">
                              {lead.name}
                            </span>
                            {lead.company && (
                              <span className="text-[11px] text-on-surface-variant flex items-center gap-1 font-medium">
                                <Building2 className="w-3 h-3 text-outline" /> {lead.company}
                              </span>
                            )}
                            <div className="flex items-center gap-2 text-[11px] text-outline mt-0.5">
                              {lead.phone && <span>{lead.phone}</span>}
                              {lead.email && <span className="truncate max-w-[140px]">{lead.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-on-surface block truncate max-w-[180px]">
                          {lead.serviceRequested || 'General Inquiry'}
                        </span>
                        <span className="text-[10px] text-outline px-1.5 py-0.5 rounded bg-surface-container inline-block mt-0.5">
                          {lead.source}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                            scoreBreakdown.grade === 'HOT' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                            scoreBreakdown.grade === 'WARM' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                            'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                          }`}>
                            {scoreBreakdown.grade === 'HOT' && <Flame className="w-3 h-3" />}
                            {scoreBreakdown.grade === 'WARM' && <Zap className="w-3 h-3" />}
                            {scoreBreakdown.grade === 'COLD' && <Snowflake className="w-3 h-3" />}
                            {scoreBreakdown.totalScore}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge leadStatus={lead.status as any} />
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={lead.assignedUserName || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const member = TEAM_MEMBERS.find(m => m.name === val);
                            assignLead(lead.id, member?.id || null, member?.name || null);
                          }}
                          className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary"
                        >
                          <option value="">Unassigned</option>
                          {TEAM_MEMBERS.map(m => (
                            <option key={m.id} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4 font-bold text-on-surface">
                        ${lead.estimatedValue?.toLocaleString() || '0'}
                      </td>

                      <td className="py-3 px-4 text-outline text-[11px]">
                        {lead.lastActivityAt}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedLeadId(lead.id)}
                            title="View Details"
                            className="p-1.5 hover:bg-surface-container rounded-lg text-outline hover:text-primary transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenConvertModal(lead)}
                            title="Convert to Contact"
                            className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-emerald-600 transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(lead)}
                            title="Edit Lead"
                            className="p-1.5 hover:bg-surface-container rounded-lg text-outline hover:text-on-surface transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              setIsDeleteConfirmOpen(true);
                            }}
                            title="Delete Lead"
                            className="p-1.5 hover:bg-error/10 rounded-lg text-error transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-outline">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="w-8 h-8 opacity-40" />
                        <span className="font-semibold text-sm">No leads match the selected criteria</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('ALL');
                            setSourceFilter('ALL');
                            setAssigneeFilter('ALL');
                            setPriorityFilter('ALL');
                            setScoreFilter('ALL');
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-3">
          {filteredLeads.map((lead) => {
            const scoreBreakdown = calculateLeadScore(lead);
            return (
              <div 
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className="p-4 rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm space-y-3 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-on-surface block">{lead.name}</span>
                    {lead.company && <span className="text-xs text-outline">{lead.company}</span>}
                  </div>
                  <Badge status={lead.status as any} />
                </div>

                <div className="text-xs text-on-surface-variant">
                  <span className="font-semibold">{lead.serviceRequested}</span>
                  <div className="text-[11px] text-outline mt-0.5">Source: {lead.source} • {lead.lastActivityAt}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 text-xs font-bold">
                  <span className="text-primary">${lead.estimatedValue?.toLocaleString()}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    scoreBreakdown.grade === 'HOT' ? 'bg-amber-500/10 text-amber-600' :
                    scoreBreakdown.grade === 'WARM' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-slate-500/10 text-slate-600'
                  }`}>
                    Score {scoreBreakdown.totalScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comprehensive Lead Detail Drawer */}
        <Drawer
          isOpen={!!selectedLead}
          onClose={() => setSelectedLeadId(null)}
          title={selectedLead?.name || 'Lead Details'}
          size="lg"
        >
          {selectedLead && (
            <div className="space-y-6 pb-8">
              {/* Header Card */}
              <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-on-surface">{selectedLead.name}</h3>
                    {selectedLead.company && (
                      <p className="text-xs text-outline flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" /> {selectedLead.company}
                      </p>
                    )}
                  </div>
                  <Badge status={selectedLead.status as any} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-outline-variant/40 text-xs">
                  <div>
                    <span className="text-[10px] text-outline font-bold uppercase block">Deal Value</span>
                    <span className="font-bold text-on-surface">${selectedLead.estimatedValue?.toLocaleString() || '0'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline font-bold uppercase block">Lead Score</span>
                    <span className="font-bold text-amber-600 flex items-center gap-0.5">
                      <Flame className="w-3.5 h-3.5" /> {selectedLead.score ?? calculateLeadScore(selectedLead).totalScore}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline font-bold uppercase block">Source</span>
                    <span className="font-medium text-on-surface">{selectedLead.source}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline font-bold uppercase block">Priority</span>
                    <span className="font-bold uppercase text-primary">{selectedLead.priority}</span>
                  </div>
                </div>

                {/* Stage and Assignee Fast Controllers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-outline-variant/40">
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase mb-1">Pipeline Stage</label>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value as LeadStatus)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2 text-xs font-bold text-on-surface"
                    >
                      {LEAD_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase mb-1">Assigned Team Member</label>
                    <select
                      value={selectedLead.assignedUserName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const member = TEAM_MEMBERS.find(m => m.name === val);
                        assignLead(selectedLead.id, member?.id || null, member?.name || null);
                      }}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2 text-xs font-semibold text-on-surface"
                    >
                      <option value="">Unassigned</option>
                      {TEAM_MEMBERS.map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Action Shortcuts */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleOpenConvertModal(selectedLead)}
                    className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Convert to Contact</span>
                  </Button>

                  <Link href={`/appointments?action=create&customerName=${encodeURIComponent(selectedLead.name)}&phone=${encodeURIComponent(selectedLead.phone || '')}`}>
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>Book Appointment</span>
                    </Button>
                  </Link>

                  <Link href={`/jobs?action=create&customerName=${encodeURIComponent(selectedLead.name)}&phone=${encodeURIComponent(selectedLead.phone || '')}`}>
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <Wrench className="w-3.5 h-3.5 text-primary" />
                      <span>Create Job</span>
                    </Button>
                  </Link>

                  <Link href={`/invoices/create?customerName=${encodeURIComponent(selectedLead.name)}&email=${encodeURIComponent(selectedLead.email || '')}`}>
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>Send Invoice</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-outline-variant text-xs font-bold">
                <button
                  onClick={() => setDetailTab('overview')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors ${
                    detailTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface'
                  }`}
                >
                  Overview & Contact
                </button>
                <button
                  onClick={() => setDetailTab('notes')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    detailTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface'
                  }`}
                >
                  <span>Notes</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-[10px]">
                    {selectedLead.notesList?.length || (selectedLead.notes ? 1 : 0)}
                  </span>
                </button>
                <button
                  onClick={() => setDetailTab('activity')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    detailTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface'
                  }`}
                >
                  <span>Timeline</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-[10px]">
                    {selectedLead.activities?.length || 0}
                  </span>
                </button>
                <button
                  onClick={() => setDetailTab('linked')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    detailTab === 'linked' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface'
                  }`}
                >
                  <span>Operations</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-[10px]">
                    {linkedAppointments.length + linkedJobs.length + linkedInvoices.length}
                  </span>
                </button>
              </div>

              {/* Tab 1: Overview */}
              {detailTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest space-y-2.5">
                    <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">Direct Contact Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-outline text-[10px] block">Phone Number</span>
                        <a href={`tel:${selectedLead.phone}`} className="font-bold text-primary hover:underline flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5" /> {selectedLead.phone || 'No phone provided'}
                        </a>
                      </div>
                      <div>
                        <span className="text-outline text-[10px] block">Email Address</span>
                        <a href={`mailto:${selectedLead.email}`} className="font-bold text-primary hover:underline flex items-center gap-1 mt-0.5">
                          <Mail className="w-3.5 h-3.5" /> {selectedLead.email || 'No email provided'}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest space-y-2">
                    <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">Service Requirement</h4>
                    <p className="font-semibold text-on-surface text-sm">{selectedLead.serviceRequested}</p>
                    {selectedLead.notes && (
                      <div className="p-2.5 rounded-lg bg-surface-container text-on-surface-variant text-xs mt-2">
                        <span className="font-bold block text-[10px] text-outline uppercase mb-0.5">Intake Request Details</span>
                        {selectedLead.notes}
                      </div>
                    )}
                  </div>

                  {/* Quality Breakdown Card */}
                  <div className="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest space-y-2">
                    <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Lead Score Breakdown
                    </h4>
                    {(() => {
                      const breakdown = calculateLeadScore(selectedLead);
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>Score: {breakdown.totalScore}/100</span>
                            <span className="text-primary">{breakdown.grade} PROSPECT</span>
                          </div>
                          <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${breakdown.totalScore}%` }}
                            />
                          </div>
                          <ul className="space-y-1 text-[11px] text-on-surface-variant pt-1">
                            {breakdown.reasons.map((r, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Tab 2: Notes */}
              {detailTab === 'notes' && (
                <div className="space-y-4">
                  {/* Create Note Form */}
                  <form onSubmit={handleCreateNoteSubmit} className="space-y-2">
                    <textarea
                      rows={3}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Add an internal technician or customer note..."
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" disabled={!newNoteContent.trim()}>
                        Post Note
                      </Button>
                    </div>
                  </form>

                  {/* Notes Feed */}
                  <div className="space-y-2.5">
                    {selectedLead.notesList && selectedLead.notesList.length > 0 ? (
                      selectedLead.notesList.map((note) => (
                        <div key={note.id} className="p-3 rounded-xl border border-outline-variant bg-surface-container-lowest space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-on-surface">{note.authorName}</span>
                            <span className="text-outline">{note.createdAt}</span>
                          </div>
                          {editingNoteId === note.id ? (
                            <div className="space-y-2 pt-1">
                              <textarea
                                rows={2}
                                value={editingNoteContent}
                                onChange={(e) => setEditingNoteContent(e.target.value)}
                                className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-xs"
                              />
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                                <Button size="sm" onClick={async () => {
                                  await updateLeadNote(note.id, editingNoteContent, selectedLead.id);
                                  setEditingNoteId(null);
                                }}>Save</Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-on-surface-variant whitespace-pre-wrap">{note.content}</p>
                          )}
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingNoteContent(note.content);
                              }}
                              className="text-[10px] text-outline hover:text-primary underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteLeadNote(note.id, selectedLead.id)}
                              className="text-[10px] text-error hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-outline text-xs">
                        No team notes added yet. Use the box above to log your first note.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Unified Activity Timeline */}
              {detailTab === 'activity' && (
                <div className="space-y-3">
                  <div className="space-y-3">
                    {(selectedLead.activities || []).map((act) => (
                      <div key={act.id} className="flex gap-3 text-xs">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 p-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-on-surface">{act.title}</span>
                            <span className="text-[10px] text-outline">{act.createdAt}</span>
                          </div>
                          {act.description && (
                            <p className="text-on-surface-variant mt-0.5">{act.description}</p>
                          )}
                          {act.userName && (
                            <span className="text-[10px] text-outline block mt-1">Logged by {act.userName}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Linked Operations */}
              {detailTab === 'linked' && (
                <div className="space-y-4 text-xs">
                  {/* Linked Appointments */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-on-surface uppercase text-[11px] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> Linked Appointments ({linkedAppointments.length})
                      </h4>
                    </div>
                    {linkedAppointments.map(a => (
                      <div key={a.id} className="p-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                        <div>
                          <span className="font-bold text-on-surface block">{a.title}</span>
                          <span className="text-[11px] text-outline">{a.startTime} • Tech: {a.technicianName}</span>
                        </div>
                        <Badge status={a.status as any} />
                      </div>
                    ))}
                    {linkedAppointments.length === 0 && (
                      <p className="text-outline text-xs">No scheduled field appointments.</p>
                    )}
                  </div>

                  {/* Linked Jobs */}
                  <div className="space-y-2 pt-2 border-t border-outline-variant/40">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-on-surface uppercase text-[11px] flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-primary" /> Work Orders & Jobs ({linkedJobs.length})
                      </h4>
                    </div>
                    {linkedJobs.map(j => (
                      <div key={j.id} className="p-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                        <div>
                          <span className="font-bold text-on-surface block">{j.title}</span>
                          <span className="text-[11px] text-outline">{j.serviceType} • Est. ${j.estimatedTotal}</span>
                        </div>
                        <Badge status={j.status as any} />
                      </div>
                    ))}
                    {linkedJobs.length === 0 && (
                      <p className="text-outline text-xs">No active work orders.</p>
                    )}
                  </div>

                  {/* Linked Invoices */}
                  <div className="space-y-2 pt-2 border-t border-outline-variant/40">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-on-surface uppercase text-[11px] flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-primary" /> Invoices & Billing ({linkedInvoices.length})
                      </h4>
                    </div>
                    {linkedInvoices.map(inv => (
                      <div key={inv.id} className="p-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                        <div>
                          <span className="font-bold text-on-surface block">{inv.number}</span>
                          <span className="text-[11px] text-outline">Total: ${inv.totalAmount.toLocaleString()} • Balance: ${inv.remainingBalance.toLocaleString()}</span>
                        </div>
                        <Badge status={inv.status as any} />
                      </div>
                    ))}
                    {linkedInvoices.length === 0 && (
                      <p className="text-outline text-xs">No invoices generated yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Drawer>

        {/* Modal: Create Lead */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Inbound Lead"
          maxWidth="md"
        >
          <form onSubmit={handleCreateLeadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Customer Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. David Miller"
                required
              />
              <Input
                label="Company / Account Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Austin Commercial Realty"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@domain.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Acquisition Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-xs font-medium text-on-surface"
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
                  onChange={(e) => setPriority(e.target.value as LeadPriority)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-xs font-medium text-on-surface"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Assign Lead To</label>
                <select
                  value={assignedUserName}
                  onChange={(e) => setAssignedUserName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-xs font-medium text-on-surface"
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
                placeholder="e.g. AC Diagnostic, Roof Repair..."
              />
              <Input
                label="Estimated Deal Value ($)"
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
                placeholder="1500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Intake Notes / Description</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any initial diagnostic details or client situation..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
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

        {/* Modal: Edit Lead */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Lead Information"
          maxWidth="md"
        >
          <form onSubmit={handleEditLeadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Customer Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Company / Account Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Acquisition Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-xs font-medium text-on-surface"
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
                  onChange={(e) => setPriority(e.target.value as LeadPriority)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-xs font-medium text-on-surface"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Assign Lead To</label>
                <select
                  value={assignedUserName}
                  onChange={(e) => setAssignedUserName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-xs font-medium text-on-surface"
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
              />
              <Input
                label="Estimated Deal Value ($)"
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Intake Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Convert to Contact & Duplicate Resolution */}
        <Modal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
          title="Convert Lead to Customer Contact"
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-on-surface-variant">
              Converting this lead will activate it as an official customer account in your CRM directory.
            </p>

            {/* Duplicate Match Warning Banner */}
            {duplicateCheck.hasDuplicate && (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Possible Duplicate Customer Detected!</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  We found existing customer accounts matching this email or phone number:
                </p>

                <div className="space-y-1.5 pt-1">
                  {duplicateCheck.matches.filter(m => m.type === 'contact').map((match) => (
                    <label 
                      key={match.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-lowest border border-outline-variant cursor-pointer text-xs"
                    >
                      <input
                        type="radio"
                        name="duplicate_choice"
                        checked={selectedLinkCustomerId === match.id}
                        onChange={() => setSelectedLinkCustomerId(match.id)}
                        className="text-primary"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-on-surface">{match.name}</span>
                        {match.company && <span className="text-outline ml-1">({match.company})</span>}
                        <div className="text-[10px] text-outline">
                          {match.email} • {match.phone} • Match confidence: {match.confidence}%
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {duplicateCheck.hasDuplicate && selectedLinkCustomerId ? (
                <Button 
                  onClick={() => handleConvertSubmit(false)}
                  className="flex-1 bg-primary text-on-primary"
                >
                  Link to Existing Contact
                </Button>
              ) : null}

              <Button 
                onClick={() => handleConvertSubmit(true)}
                variant={duplicateCheck.hasDuplicate && selectedLinkCustomerId ? 'outline' : 'primary'}
                className="flex-1"
              >
                Create New Customer Account
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Single Lead Delete Confirmation */}
        <Modal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          title="Delete Lead"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-on-surface-variant">
              Are you sure you want to delete this lead? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
              <Button 
                variant="danger" 
                onClick={async () => {
                  if (selectedLeadId) {
                    await deleteLead(selectedLeadId);
                    setSelectedLeadId(null);
                    setIsDeleteConfirmOpen(false);
                  }
                }}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Bulk Delete Confirmation */}
        <Modal
          isOpen={isBulkDeleteConfirmOpen}
          onClose={() => setIsBulkDeleteConfirmOpen(false)}
          title="Bulk Delete Leads"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-on-surface-variant">
              Are you sure you want to delete all <span className="font-bold">{selectedLeadIds.length} selected leads</span>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIsBulkDeleteConfirmOpen(false)}>Cancel</Button>
              <Button 
                variant="danger" 
                onClick={async () => {
                  await bulkDeleteLeads(selectedLeadIds);
                  setSelectedLeadIds([]);
                  setIsBulkDeleteConfirmOpen(false);
                }}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-outline">Loading CRM Leads...</div>}>
      <LeadsContent />
    </Suspense>
  );
}
