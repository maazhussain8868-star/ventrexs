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
import { Estimate, EstimateStatus } from '@/types';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Send,
  Check,
  X,
  ChevronRight,
  ArrowRight,
  Receipt,
  User,
  Calendar,
  Trash2,
  TrendingUp,
  Percent
} from 'lucide-react';

function EstimatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    estimates,
    estimateStats,
    customers,
    jobs,
    addEstimate,
    sendEstimate,
    approveEstimate,
    rejectEstimate,
    convertEstimateToInvoice,
    deleteEstimate,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(searchParams.get('action') === 'create');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Estimate Form State
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState(searchParams.get('customerId') || '');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [jobId, setJobId] = useState(searchParams.get('jobId') || '');
  const [validUntil, setValidUntil] = useState('2026-09-30');
  const [taxRate, setTaxRate] = useState<number>(8.25);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState('Payment due net 30 upon work completion. Includes standard warranty.');

  // Form Line Items
  const [items, setItems] = useState<Array<{ id: string; description: string; quantity: number; unitPrice: number }>>([
    { id: '1', description: 'Comprehensive Diagnostic & System Evaluation', quantity: 1, unitPrice: 250 },
    { id: '2', description: 'Equipment Installation & Parts Labor', quantity: 4, unitPrice: 150 },
  ]);

  const filteredEstimates = useMemo(() => {
    return estimates.filter(e => {
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesNum = e.estimateNumber.toLowerCase().includes(query);
        const matchesTitle = e.title.toLowerCase().includes(query);
        const matchesCustomer = e.customerName?.toLowerCase().includes(query) || false;
        if (!matchesNum && !matchesTitle && !matchesCustomer) return false;
      }
      return true;
    });
  }, [estimates, statusFilter, searchTerm]);

  const computedSubtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);
  }, [items]);

  const computedTax = useMemo(() => {
    return Math.round(computedSubtotal * (Number(taxRate) || 0)) / 100;
  }, [computedSubtotal, taxRate]);

  const computedTotal = useMemo(() => {
    return Math.max(0, computedSubtotal + computedTax - (Number(discountAmount) || 0));
  }, [computedSubtotal, computedTax, discountAmount]);

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const cust = customers.find(c => c.id === id);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerEmail(cust.email || '');
      setCustomerPhone(cust.phone || '');
    }
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(it => it.id !== id));
  };

  const handleItemChange = (id: string, field: 'description' | 'quantity' | 'unitPrice', val: any) => {
    setItems(prev => prev.map(it => {
      if (it.id === id) {
        return {
          ...it,
          [field]: field === 'description' ? val : Number(val) || 0
        };
      }
      return it;
    }));
  };

  const handleCreateEstimateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerName.trim()) return;

    const selectedJob = jobs.find(j => j.id === jobId);

    await addEstimate({
      title,
      customerId: customerId || undefined,
      customerName,
      customerEmail,
      customerPhone,
      jobId: jobId || undefined,
      jobTitle: selectedJob?.title,
      items: items.map(it => ({
        id: it.id,
        description: it.description || 'Service Line Item',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        amount: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
      taxRate: Number(taxRate) || 0,
      discountAmount: Number(discountAmount) || 0,
      validUntil,
      notes,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setCustomerId('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setJobId('');
  };

  const columns: Column<Estimate>[] = [
    {
      key: 'estimateNumber',
      header: 'Estimate',
      sortable: true,
      render: (est) => (
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <Link 
              href={`/estimates/${est.id}`}
              className="font-bold text-on-surface hover:text-primary transition-colors block"
            >
              {est.estimateNumber}: {est.title}
            </Link>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
              <span>{est.customerName || 'Direct Client'}</span>
              {est.jobTitle && (
                <span className="text-outline truncate max-w-[180px]">
                  • Job: {est.jobTitle}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (est) => <Badge estimateStatus={est.status} size="sm" />,
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      sortable: true,
      render: (est) => (
        <div>
          <span className="text-sm font-extrabold text-on-surface block">
            ${est.totalAmount.toLocaleString()}
          </span>
          <span className="text-[11px] text-outline">
            Subtotal: ${est.subtotal.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'validUntil',
      header: 'Valid Until',
      sortable: true,
      render: (est) => (
        <span className="text-xs text-on-surface font-medium">
          {est.validUntil || '30 Days'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (est) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/estimates/${est.id}`}>
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold px-2.5">
              View <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </Link>
          {est.status === 'APPROVED' && !est.invoiceId && (
            <Button
              size="sm"
              variant="primary"
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 gap-1"
              onClick={() => convertEstimateToInvoice(est.id)}
            >
              <Receipt className="w-3 h-3" /> Invoice
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Estimates & Proposals"
        subtitle="Create itemized quotes, collect customer approvals, and convert directly to invoices."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Estimates', href: '/estimates' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/jobs">
              <Button variant="outline" size="sm">
                View Jobs
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 shadow-sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              New Estimate
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard
          label="Total Estimates"
          value={estimateStats.totalEstimates.toString()}
          subtext="All created"
          icon={<FileText className="w-4 h-4 text-primary" />}
        />
        <StatCard
          label="Draft / Preparing"
          value={estimateStats.draft.toString()}
          subtext="Unsent"
          icon={<Clock className="w-4 h-4 text-amber-500" />}
        />
        <StatCard
          label="Sent to Clients"
          value={estimateStats.sent.toString()}
          subtext="Awaiting response"
          icon={<Send className="w-4 h-4 text-sky-500" />}
        />
        <StatCard
          label="Approved Quotes"
          value={estimateStats.approved.toString()}
          subtext="Ready for invoicing"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          label="Approved Value"
          value={`$${estimateStats.approvedValue.toLocaleString()}`}
          subtext="Contracted revenue"
          icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
        />
        <StatCard
          label="Pipeline Quote Value"
          value={`$${estimateStats.pipelineValue.toLocaleString()}`}
          subtext="Pending decision"
          icon={<TrendingUp className="w-4 h-4 text-primary" />}
        />
      </div>

      {/* Search & Status Filter */}
      <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-xs mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search estimate number, title, customer..."
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
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="VIEWED">Viewed</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={filteredEstimates}
          emptyTitle="No estimates found matching the selected filters."
        />
      </div>

      {/* Mobile Touch Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredEstimates.length === 0 ? (
          <div className="bg-surface p-8 rounded-xl border border-outline-variant text-center text-outline">
            No estimates found.
          </div>
        ) : (
          filteredEstimates.map((est) => (
            <div 
              key={est.id}
              className="bg-surface p-4 rounded-xl border border-outline-variant shadow-xs flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge estimateStatus={est.status} size="sm" />
                  <Link 
                    href={`/estimates/${est.id}`}
                    className="font-bold text-base text-on-surface mt-1.5 block hover:text-primary"
                  >
                    {est.estimateNumber}: {est.title}
                  </Link>
                  <span className="text-xs text-on-surface-variant block mt-0.5">
                    {est.customerName || 'Direct Client'}
                  </span>
                </div>
                <span className="text-base font-extrabold text-on-surface">
                  ${est.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-outline pt-2 border-t border-outline-variant/60">
                <span>Valid: {est.validUntil || '30 Days'}</span>
                <span>{est.items?.length || 0} Line Items</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {est.status === 'APPROVED' && !est.invoiceId && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2"
                    onClick={() => convertEstimateToInvoice(est.id)}
                  >
                    Convert to Invoice
                  </Button>
                )}
                <Link
                  href={`/estimates/${est.id}`}
                  className="flex-1 text-center py-2 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-lg flex items-center justify-center gap-1 border border-outline-variant"
                >
                  Manage Quote <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Estimate Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Service Estimate"
      >
        <form onSubmit={handleCreateEstimateSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
              Estimate Title *
            </label>
            <Input
              required
              placeholder="e.g., Rooftop HVAC Compressor Replacement & Tuning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Existing Customer
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
                Customer Name *
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
                Linked Work Order (Job)
              </label>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              >
                <option value="">-- None / Standalone Estimate --</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title} ({j.customerName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Valid Until Date
              </label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Line Items Editor */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Itemized Line Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-surface-container p-2.5 rounded-lg border border-outline-variant">
                  <div className="col-span-6">
                    <input
                      type="text"
                      required
                      placeholder="Service / Part Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-surface rounded border border-outline-variant text-on-surface"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-surface rounded border border-outline-variant text-on-surface text-center"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Unit $"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-surface rounded border border-outline-variant text-on-surface text-right"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Taxes, Discounts & Live Total Calculation */}
          <div className="p-3 bg-surface-container rounded-xl border border-outline-variant text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-outline">Subtotal:</span>
              <span className="font-bold text-on-surface">${computedSubtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-outline flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" /> Tax Rate (%):
              </span>
              <input
                type="number"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-20 px-2 py-1 text-right bg-surface rounded border border-outline-variant text-on-surface font-semibold"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-outline">Discount ($):</span>
              <input
                type="number"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-20 px-2 py-1 text-right bg-surface rounded border border-outline-variant text-on-surface font-semibold"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant text-sm font-extrabold">
              <span className="text-on-surface">Calculated Total:</span>
              <span className="text-primary text-base">${computedTotal.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
              Terms & Customer Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 text-xs bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Estimate
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

export default function EstimatesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-outline">Loading Estimates...</div>}>
      <EstimatesContent />
    </Suspense>
  );
}
