'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/context/AppContext';
import { Technician, TechnicianStatus } from '@/types';
import {
  Users,
  UserPlus,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  ShieldCheck,
  Wrench,
  Power,
  RefreshCw,
} from 'lucide-react';

const COMMON_ROLES = [
  'Lead Technician',
  'HVAC Specialist',
  'Master Electrician',
  'Licensed Plumber',
  'Field Service Tech',
  'Senior Diagnostic Tech',
  'Apprentice Tech',
  'Dispatcher & Coordinator',
];

export default function TeamManagementPage() {
  const {
    technicians,
    addTechnician,
    updateTechnician,
    setTechnicianStatus,
    deleteTechnician,
    refreshTechnicians,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TechnicianStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [deletingTech, setDeletingTech] = useState<Technician | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(COMMON_ROLES[0]);
  const [status, setStatus] = useState<TechnicianStatus>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState<TechnicianStatus>('active');

  const filteredTechnicians = useMemo(() => {
    return technicians.filter(t => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.role && t.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.phone && t.phone.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [technicians, searchQuery, statusFilter]);

  const activeCount = useMemo(() => technicians.filter(t => t.status === 'active').length, [technicians]);
  const inactiveCount = useMemo(() => technicians.filter(t => t.status === 'inactive').length, [technicians]);
  const deactivatedCount = useMemo(() => technicians.filter(t => t.status === 'deactivated').length, [technicians]);

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setPhone('');
    setRole(COMMON_ROLES[0]);
    setStatus('active');
    setIsAddModalOpen(true);
  };

  const handleCreateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast({ title: 'Name is required', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addTechnician({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        role: role.trim() || 'Technician',
        status,
      });

      if (res) {
        setIsAddModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (tech: Technician) => {
    setEditingTech(tech);
    setEditName(tech.name);
    setEditEmail(tech.email || '');
    setEditPhone(tech.phone || '');
    setEditRole(tech.role || COMMON_ROLES[0]);
    setEditStatus(tech.status);
  };

  const handleUpdateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech || !editName.trim()) {
      showToast({ title: 'Name is required', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await updateTechnician(editingTech.id, {
        name: editName.trim(),
        email: editEmail.trim() || undefined,
        phone: editPhone.trim() || undefined,
        role: editRole.trim() || 'Technician',
        status: editStatus,
      });

      if (success) {
        setEditingTech(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (tech: Technician) => {
    const nextStatus: TechnicianStatus = tech.status === 'active' ? 'inactive' : 'active';
    await setTechnicianStatus(tech.id, nextStatus);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTech) return;
    setIsSubmitting(true);
    try {
      await deleteTechnician(deletingTech.id);
      setDeletingTech(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTechnicians();
      showToast({ title: 'Team roster refreshed', type: 'info' });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AppShell title="Team Management">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Business Settings
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-on-surface">
                  Team & Field Technicians
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Manage your workforce, assign dispatchable field technicians, and control employee roles.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleOpenAddModal} className="gap-1.5">
              <UserPlus className="w-4 h-4" /> Add Team Member
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-on-surface-variant">Total Workforce</p>
            <p className="text-2xl font-bold text-on-surface mt-1">{technicians.length}</p>
            <p className="text-[11px] text-on-surface-variant mt-1">Total registered employees</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active & Dispatchable</p>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-on-surface mt-1">{activeCount}</p>
            <p className="text-[11px] text-on-surface-variant mt-1">Available for job scheduling</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Inactive / On Leave</p>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-on-surface mt-1">{inactiveCount}</p>
            <p className="text-[11px] text-on-surface-variant mt-1">Temporarily off rotation</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Deactivated</p>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-on-surface mt-1">{deactivatedCount}</p>
            <p className="text-[11px] text-on-surface-variant mt-1">Former staff / restricted</p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search by name, role, email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider shrink-0">
              Filter:
            </span>
            {(['all', 'active', 'inactive', 'deactivated'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  statusFilter === f
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Technicians Table */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-sm overflow-hidden">
          {filteredTechnicians.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto text-on-surface-variant">
                <Wrench className="w-6 h-6 text-outline" />
              </div>
              <h3 className="text-base font-bold text-on-surface">No team members found</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                {technicians.length === 0
                  ? 'Add your first technician or service staff member to begin dispatching jobs and tracking field work.'
                  : 'No team members match your active search and filter criteria.'}
              </p>
              {technicians.length === 0 && (
                <Button onClick={handleOpenAddModal} size="sm" className="mt-2 gap-1.5">
                  <UserPlus className="w-4 h-4" /> Add Technician
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low/70 border-b border-outline-variant/60 text-on-surface-variant font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Employee / Technician</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Contact Details</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-on-surface">
                  {filteredTechnicians.map(tech => {
                    const initials = tech.name
                      .split(' ')
                      .map(p => p.charAt(0))
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={tech.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20">
                              {initials || 'T'}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-on-surface">{tech.name}</p>
                              <p className="text-[11px] text-on-surface-variant">
                                Added {new Date(tech.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container text-on-surface border border-outline-variant/40">
                            <Briefcase className="w-3 h-3 text-primary" />
                            {tech.role || 'Field Tech'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 space-y-1">
                          {tech.email ? (
                            <div className="flex items-center gap-1.5 text-on-surface-variant">
                              <Mail className="w-3.5 h-3.5 text-outline" />
                              <span>{tech.email}</span>
                            </div>
                          ) : (
                            <span className="text-outline italic text-[11px]">No email</span>
                          )}
                          {tech.phone && (
                            <div className="flex items-center gap-1.5 text-on-surface-variant">
                              <Phone className="w-3.5 h-3.5 text-outline" />
                              <span>{tech.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                              tech.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : tech.status === 'inactive'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                tech.status === 'active'
                                  ? 'bg-emerald-500'
                                  : tech.status === 'inactive'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            {tech.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(tech)}
                              title={tech.status === 'active' ? 'Mark Inactive' : 'Activate'}
                              className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(tech)}
                              title="Edit Details"
                              className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingTech(tech)}
                              title="Delete Member"
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security & RLS Isolation Note */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 flex items-start gap-3 text-xs text-on-surface-variant">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-on-surface">Multi-Tenant Employee Isolation</p>
            <p>
              Technicians and staff records are strictly scoped to your authorized business workspace. Team members added here
              appear dynamically in job assignments, work order tracking, and lead dispatching.
            </p>
          </div>
        </div>

        {/* ADD TECHNICIAN MODAL */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Team Member / Technician"
        >
          <form onSubmit={handleCreateTechnician} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Marcus Vance"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="tech@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Role / Specialization</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Lead HVAC Specialist"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_ROLES.slice(0, 4).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="text-[11px] px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Initial Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TechnicianStatus)}
                className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active (Available for Dispatch)</option>
                <option value="inactive">Inactive (On Leave / Standby)</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                {isSubmitting ? 'Saving...' : 'Add Member'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* EDIT TECHNICIAN MODAL */}
        <Modal
          isOpen={Boolean(editingTech)}
          onClose={() => setEditingTech(null)}
          title="Edit Team Member Details"
        >
          <form onSubmit={handleUpdateTechnician} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Marcus Vance"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="tech@example.com"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Role / Specialization</label>
              <Input
                placeholder="e.g. Lead HVAC Specialist"
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Status</label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as TechnicianStatus)}
                className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active (Available for Dispatch)</option>
                <option value="inactive">Inactive (On Leave / Standby)</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingTech(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* DELETE CONFIRMATION MODAL */}
        <Modal
          isOpen={Boolean(deletingTech)}
          onClose={() => setDeletingTech(null)}
          title="Remove Team Member"
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-on-surface">
              Are you sure you want to remove <span className="font-bold">{deletingTech?.name}</span>?
            </p>
            <p className="text-xs text-on-surface-variant">
              This will remove the technician record from your business. Historical job records associated with this
              technician will be preserved.
            </p>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingTech(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                {isSubmitting ? 'Removing...' : 'Remove Member'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
