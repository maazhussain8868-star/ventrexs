'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApp } from '@/context/AppContext';
import { Customer, RiskLevel } from '@/types';
import { Search, Plus, Phone, Mail, Sparkles, ChevronRight, UserPlus, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const { customers, addCustomer, showToast, overdueAmount, totalOutstanding } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New customer form state
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      c => c.company.toLowerCase().includes(q) ||
           c.name.toLowerCase().includes(q) ||
           c.email.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !name || !email) {
      showToast({ title: 'Please fill in required fields', type: 'error' });
      return;
    }

    addCustomer({
      name,
      company,
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
      preferredContact: 'email'
    });

    setIsAddModalOpen(false);
    setCompany('');
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
  };

  return (
    <AppShell
      title="Customers"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Customer
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mb-1">Customer Accounts & Statements</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Manage client credit ratings, outstanding receivables, and payment track records.
          </p>
        </div>

        {/* Overview Stats Bento */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Outstanding Receivables
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-primary font-mono">
              ${totalOutstanding.toLocaleString()}
            </p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <p className="text-[11px] font-bold text-error uppercase tracking-wider mb-1">
              Overdue Receivables
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-error font-mono">
              ${overdueAmount.toLocaleString()}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <p className="text-[11px] font-bold text-tertiary uppercase tracking-wider mb-1">
              Payments Received
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-tertiary font-mono">
              $156,800
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Find a customer by company name, primary contact, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-xl py-3 pl-11 pr-4 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-xs"
          />
        </div>

        {/* Customer List */}
        {filteredCustomers.length === 0 ? (
          <EmptyState
            title="No Customers Found"
            description={searchQuery ? `No client found for "${searchQuery}".` : "You haven't added any customers yet."}
            actionLabel="Add Customer"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {filteredCustomers.map((c) => (
              <article
                key={c.id}
                className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-primary/30 transition-all"
              >
                {/* Top row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        href={`/customers/${c.id}`}
                        className="text-base sm:text-lg font-bold text-on-surface hover:text-primary transition-colors"
                      >
                        {c.company}
                      </Link>
                      <Badge risk={c.riskLevel} size="sm" />
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Primary Contact: <strong className="text-on-surface">{c.name}</strong> • Last contact: {c.lastContactDate}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Outstanding Receivables
                    </p>
                    <p className={`text-xl font-bold font-mono ${c.outstandingReceivables > 0 ? 'text-error' : 'text-tertiary'}`}>
                      ${c.outstandingReceivables.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Middle Data Strip */}
                <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-surface-container-low rounded-xl border border-outline-variant/60 mb-4 text-xs">
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">Payments Received</p>
                    <p className="font-bold text-on-surface mt-0.5 font-mono">${c.paymentsReceived.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">Overdue Invoices</p>
                    <p className={`font-bold mt-0.5 ${c.overdueCount > 0 ? 'text-error' : 'text-on-surface'}`}>
                      {c.overdueCount} Overdue
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">Credit Score</p>
                    <p className="font-bold text-primary mt-0.5 font-mono">{c.creditScore} / 850</p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href={`tel:${c.phone}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast({ title: `Calling ${c.name}`, description: c.phone, type: 'info' });
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call
                  </a>
                  <a
                    href={`mailto:${c.email}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast({ title: `Opening email to ${c.email}`, type: 'info' });
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </a>
                  <Link
                    href={`/follow-up?customerName=${encodeURIComponent(c.company)}`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-on-primary-fixed-variant transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Copilot Insight
                  </Link>
                  <Link
                    href={`/customers/${c.id}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-primary hover:underline ml-auto"
                  >
                    View Statement
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
        description="Register a new business account for invoicing and ethical collection workflows."
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleAddCustomerSubmit}>
              Create Customer
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
          <Input
            label="Company Name"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Apex Industrial Solutions"
          />
          <Input
            label="Contact Person Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Michael Thorne"
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="billing@apexindustrial.com"
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 839-2911"
          />
          <Input
            label="Business Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="500 Corporate Parkway, Suite 100"
          />
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              Assessed Payment Reliability
            </label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm"
            >
              <option value="low">Prompt Payer (Reliable 14-day settlement)</option>
              <option value="medium">Standard Terms (Occasional courtesy follow-up)</option>
              <option value="high">Requires Proactive Communication</option>
            </select>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
