'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { useApp } from '@/context/AppContext';
import { Customer, RiskLevel } from '@/types';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  DollarSign, 
  ChevronRight, 
  FileText,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function ContactsPage() {
  const router = useRouter();
  const { customers, addCustomer, showToast, totalOutstanding } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // New customer form state
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (riskFilter !== 'ALL' && c.riskLevel !== riskFilter) return false;
      return true;
    });
  }, [customers, riskFilter]);

  const totalPaidAll = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
  }, [customers]);

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast({ title: 'Please provide name and email', type: 'error' });
      return;
    }

    const created = await addCustomer({
      name,
      company: company || name,
      email,
      phone: phone || '+1 (555) 000-0000',
      address: address || 'United States',
      totalOutstanding: 0,
      outstandingReceivables: 0,
      totalPaid: 0,
      paymentsReceived: 0,
      overdueCount: 0,
      activeInvoicesCount: 0,
      riskLevel,
      creditScore: riskLevel === 'low' ? 780 : riskLevel === 'medium' ? 710 : 640,
      lastContactDate: 'Today',
      preferredContact: 'phone'
    });

    if (created) {
      setIsAddModalOpen(false);
      setCompany('');
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Contact Name & Company',
      sortable: true,
      render: (c) => (
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
            {c.company.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-on-surface hover:text-primary transition-colors block">
              {c.name}
            </span>
            <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-outline" />
              {c.company}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Phone / Email',
      render: (c) => (
        <div className="text-xs text-on-surface-variant space-y-0.5">
          {c.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-outline" /> {c.phone}</div>}
          {c.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-outline" /> {c.email}</div>}
        </div>
      ),
    },
    {
      key: 'riskLevel',
      header: 'Client Status',
      sortable: true,
      render: (c) => <Badge risk={c.riskLevel} size="sm" />,
    },
    {
      key: 'totalOutstanding',
      header: 'Outstanding AR',
      sortable: true,
      render: (c) => (
        <div>
          <span className={`text-xs sm:text-sm font-bold block ${c.totalOutstanding > 0 ? 'text-error' : 'text-tertiary'}`}>
            ${c.totalOutstanding.toLocaleString()}
          </span>
          <span className="text-[10px] text-outline">
            {c.activeInvoicesCount} active invoice{c.activeInvoicesCount !== 1 ? 's' : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'totalPaid',
      header: 'Lifetime Settled',
      sortable: true,
      render: (c) => (
        <span className="text-xs sm:text-sm font-semibold text-on-surface">
          ${c.totalPaid.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Statement',
      render: (c) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/customers/${c.id}`}
            className="px-2.5 py-1 text-xs font-bold text-primary bg-primary-fixed/20 hover:bg-primary-fixed/40 rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <span>Statement</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <AppShell title="Contacts Directory">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <PageHeader
          title="Client & Customer Contacts"
          subtitle="Directory of residential homeowners, commercial accounts, and billing ledgers"
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                + Add Contact
              </Button>
            </div>
          }
        />

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Accounts"
            value={customers.length}
            subtext="Active client records"
            icon={<Users className="w-4 h-4 text-primary" />}
          />
          <StatCard
            label="Outstanding AR"
            value={`$${totalOutstanding.toLocaleString()}`}
            subtext="Open accounts receivable"
            icon={<DollarSign className="w-4 h-4 text-error" />}
            variant="error"
          />
          <StatCard
            label="Lifetime Revenue"
            value={`$${totalPaidAll.toLocaleString()}`}
            subtext="Settled client payments"
            icon={<ShieldCheck className="w-4 h-4 text-tertiary" />}
            variant="success"
          />
          <StatCard
            label="Prompt Payers"
            value={customers.filter(c => c.riskLevel === 'low').length}
            subtext="Zero late collections"
            icon={<ShieldCheck className="w-4 h-4 text-primary" />}
            variant="primary"
          />
        </div>

        {/* Contacts Data Table */}
        <DataTable
          data={filteredCustomers}
          columns={columns}
          searchPlaceholder="Search contacts by name, company, email, or phone..."
          searchFilter={(c, query) =>
            c.name.toLowerCase().includes(query) ||
            c.company.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.phone.toLowerCase().includes(query)
          }
          filterComponent={
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Client Types ({customers.length})</option>
              <option value="low">Prompt Payers (Low Risk)</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          }
          onRowClick={(c) => router.push(`/customers/${c.id}`)}
          emptyTitle="No contacts found"
          emptyDescription="Add a new customer contact or adjust your search filter."
          emptyAction={
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
              + Add Contact
            </Button>
          }
        />
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Contact"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleAddCustomerSubmit}>
              Save Contact
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
          <Input
            label="Primary Contact Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Smith"
            required
          />

          <Input
            label="Company / Account Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Acme Residential or Smith Residence"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <Input
            label="Service / Billing Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, Austin, TX 78701"
          />

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Client Payment Profile
            </label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as any)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="low">Standard / Prompt Payer (Low Risk)</option>
              <option value="medium">Requires Monitoring (Medium Risk)</option>
              <option value="high">High Risk (Pre-payment recommended)</option>
            </select>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
