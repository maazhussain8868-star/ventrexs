'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { useApp } from '@/context/AppContext';
import { Job, JobStatus, JobPriority, PriorityLevel } from '@/types';
import { 
  Wrench, 
  Plus, 
  Clock, 
  User, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Search,
  Filter,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react';

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    jobs, 
    jobStats,
    customers,
    leads,
    addJob, 
    updateJobStatus,
    assignJobTechnician,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(searchParams.get('action') === 'create');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [technicianFilter, setTechnicianFilter] = useState<string>('ALL');

  // Form State
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [serviceType, setServiceType] = useState('HVAC Repair & Diagnostic');
  const [technicianName, setTechnicianName] = useState('Leo Martinez');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [estimatedDuration, setEstimatedDuration] = useState(120);
  const [estimatedTotal, setEstimatedTotal] = useState<number>(1500);
  const [scheduledDate, setScheduledDate] = useState('2026-08-28');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const serviceCategories = [
    'HVAC Repair & Diagnostic',
    'Commercial AC Installation',
    'Heat Pump Replacement',
    'Emergency Plumbing Repair',
    'Electrical Panel Upgrade',
    'Roofing Inspection & Repair',
    'Preventive Maintenance',
    'VRF Commissioning',
    'Ductwork & Airflow Balancing',
    'General Contracting',
  ];

  const uniqueTechnicians = useMemo(() => {
    const names = new Set<string>();
    jobs.forEach(j => {
      if (j.technicianName && j.technicianName !== 'Unassigned') names.add(j.technicianName);
      if (j.assignedTechName) names.add(j.assignedTechName);
    });
    return Array.from(names);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      if (statusFilter !== 'ALL' && j.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && j.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
      if (technicianFilter !== 'ALL' && j.technicianName !== technicianFilter && j.assignedTechName !== technicianFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = j.title.toLowerCase().includes(query);
        const matchesCustomer = j.customerName.toLowerCase().includes(query);
        const matchesService = j.serviceType.toLowerCase().includes(query);
        const matchesAddress = j.propertyAddress?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesCustomer && !matchesService && !matchesAddress) return false;
      }
      return true;
    });
  }, [jobs, statusFilter, priorityFilter, technicianFilter, searchTerm]);

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const cust = customers.find(c => c.id === id);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone || '');
      setCustomerEmail(cust.email || '');
      setPropertyAddress(cust.address || '');
    }
  };

  const handleCreateJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerName.trim()) return;

    await addJob({
      title,
      customerId: customerId || undefined,
      customerName,
      customerPhone,
      customerEmail,
      propertyAddress,
      serviceType,
      description,
      status: 'NEW',
      priority,
      technicianName,
      assignedTechName: technicianName,
      scheduledDate,
      estimatedDurationMinutes: Number(estimatedDuration) || 60,
      estimatedTotal: Number(estimatedTotal) || 0,
      actualTotal: 0,
      notes,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setCustomerId('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setPropertyAddress('');
    setDescription('');
    setNotes('');
  };

  const columns: Column<Job>[] = [
    {
      key: 'title',
      header: 'Job & Location',
      sortable: true,
      render: (job) => (
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <Link 
              href={`/jobs/${job.id}`}
              className="font-bold text-on-surface hover:text-primary transition-colors block"
            >
              {job.title}
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant mt-0.5">
              <span className="font-medium text-on-surface">{job.customerName}</span>
              {job.propertyAddress && (
                <span className="flex items-center gap-0.5 text-outline">
                  <MapPin className="w-3 h-3 text-outline" /> {job.propertyAddress.split(',')[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service & Tech',
      render: (job) => (
        <div>
          <span className="font-semibold text-on-surface text-xs block">{job.serviceType}</span>
          <span className="text-[11px] text-outline flex items-center gap-1 mt-0.5">
            <User className="w-3 h-3 text-outline" />
            {job.assignedTechName || job.technicianName || 'Unassigned'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (job) => <Badge jobStatus={job.status} size="sm" />,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (job) => <Badge priority={job.priority as any} size="sm" />,
    },
    {
      key: 'scheduledDate',
      header: 'Schedule',
      sortable: true,
      render: (job) => (
        <div className="text-xs">
          <span className="font-medium text-on-surface block flex items-center gap-1">
            <Calendar className="w-3 h-3 text-outline" />
            {job.scheduledDate || 'Unscheduled'}
          </span>
          {job.estimatedDurationMinutes && (
            <span className="text-[11px] text-outline flex items-center gap-1">
              <Clock className="w-3 h-3 text-outline" /> {job.estimatedDurationMinutes} mins
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'estimatedTotal',
      header: 'Value',
      sortable: true,
      render: (job) => (
        <div>
          <span className="text-xs sm:text-sm font-bold text-on-surface block">
            ${(job.estimatedTotal || job.actualTotal || 0).toLocaleString()}
          </span>
          {job.invoiceId ? (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Invoiced
            </span>
          ) : job.estimateId ? (
            <span className="text-[10px] font-semibold text-primary bg-primary-container/20 px-1.5 py-0.5 rounded">
              Estimate Linked
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (job) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/jobs/${job.id}`}>
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold px-2.5">
              Open <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Jobs & Field Operations"
        subtitle="Manage work orders, field dispatches, technician assignments, and job timelines."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Jobs', href: '/jobs' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/estimates">
              <Button variant="outline" size="sm" className="gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                Estimates
              </Button>
            </Link>
            <Button 
              variant="primary" 
              size="sm" 
              className="gap-1.5 shadow-sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              New Work Order
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard
          label="Total Jobs"
          value={jobStats.totalJobs.toString()}
          subtext="All recorded"
          icon={<Wrench className="w-4 h-4 text-primary" />}
        />
        <StatCard
          label="New & Unscheduled"
          value={jobStats.newJobs.toString()}
          subtext="Awaiting dispatch"
          icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
        />
        <StatCard
          label="In Progress"
          value={jobStats.inProgress.toString()}
          subtext="Technicians on-site"
          icon={<Play className="w-4 h-4 text-sky-500" />}
        />
        <StatCard
          label="Completed"
          value={jobStats.completed.toString()}
          subtext="Ready for invoice"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          label="Urgent Priority"
          value={jobStats.urgent.toString()}
          subtext="Emergency response"
          icon={<AlertCircle className="w-4 h-4 text-rose-500" />}
        />
        <StatCard
          label="Total Pipeline Value"
          value={`$${jobStats.totalValue.toLocaleString()}`}
          subtext="Work order volume"
          icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-xs mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search job title, customer, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="INVOICED">Invoiced</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
            >
              <option value="ALL">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
            >
              <option value="ALL">All Technicians</option>
              {uniqueTechnicians.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={filteredJobs}
          emptyTitle="No service work orders found matching filters."
        />
      </div>

      {/* Mobile Touch-Friendly Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredJobs.length === 0 ? (
          <div className="bg-surface p-8 rounded-xl border border-outline-variant text-center text-outline">
            No work orders match the selected filters.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div 
              key={job.id}
              className="bg-surface p-4 rounded-xl border border-outline-variant shadow-xs flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge jobStatus={job.status} size="sm" />
                  <Link 
                    href={`/jobs/${job.id}`}
                    className="font-bold text-base text-on-surface mt-1.5 block hover:text-primary"
                  >
                    {job.title}
                  </Link>
                  <span className="text-xs font-medium text-on-surface-variant block mt-0.5">
                    {job.customerName}
                  </span>
                </div>
                <Badge priority={job.priority as any} size="sm" />
              </div>

              {job.propertyAddress && (
                <div className="flex items-center gap-1.5 text-xs text-outline bg-surface-container px-2.5 py-1.5 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{job.propertyAddress}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-outline-variant/60">
                <div>
                  <span className="text-[11px] text-outline block">Technician</span>
                  <span className="font-semibold text-on-surface">
                    {job.assignedTechName || job.technicianName || 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-outline block">Estimated Total</span>
                  <span className="font-bold text-on-surface">
                    ${(job.estimatedTotal || job.actualTotal || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {job.customerPhone && (
                  <a 
                    href={`tel:${job.customerPhone}`}
                    className="flex items-center gap-1 text-xs font-semibold text-primary px-3 py-1.5 rounded-lg bg-primary/10"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                )}
                <Link 
                  href={`/jobs/${job.id}`}
                  className="flex-1 text-center py-2 px-3 bg-primary text-on-primary text-xs font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs"
                >
                  Manage Job <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Job Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Service Work Order"
      >
        <form onSubmit={handleCreateJobSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
              Work Order Title *
            </label>
            <Input
              required
              placeholder="e.g., Rooftop AC Unit Diagnostic & Capacitor Overhaul"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Existing Customer Link
              </label>
              <select
                value={customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              >
                <option value="">-- Direct Input / New Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Customer Full Name *
              </label>
              <Input
                required
                placeholder="David Miller"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Customer Phone
              </label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Customer Email
              </label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
              Job Property Address
            </label>
            <Input
              placeholder="742 Industrial Pkwy, Austin, TX"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Service Category
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              >
                {serviceCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Assigned Technician
              </label>
              <select
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              >
                <option value="Leo Martinez">Leo Martinez (Master HVAC)</option>
                <option value="Sam Ortiz">Sam Ortiz (Senior Tech)</option>
                <option value="Sarah Jenkins">Sarah Jenkins (Field Estimator)</option>
                <option value="Carlos Rodriguez">Carlos Rodriguez (Plumbing Master)</option>
                <option value="Marcus Vance">Marcus Vance (Operations Lead)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Scheduled Date
              </label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent (Emergency)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Est. Value ($)
              </label>
              <Input
                type="number"
                value={estimatedTotal}
                onChange={(e) => setEstimatedTotal(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
              Scope Description & Access Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Detail required parts, safety protocols, gate access codes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Dispatch Work Order
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-outline">Loading Jobs & Field Operations...</div>}>
      <JobsContent />
    </Suspense>
  );
}
