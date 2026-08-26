'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Sparkles, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  CreditCard,
  MessageSquarePlus,
  Wrench,
  FileText,
  UserPlus,
  Flame,
  Star
} from 'lucide-react';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { customers, invoices, leads, appointments, jobs, reviewRequests, customerFeedback, showToast } = useApp();

  const customerId = params.id as string;
  const customer = customers.find(c => c.id === customerId) || customers[0];

  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'leads' | 'appointments' | 'jobs' | 'reviews' | 'notes'>('invoices');
  const [notes, setNotes] = useState(customer?.notes || '');
  const [newNote, setNewNote] = useState('');

  const customerInvoices = useMemo(() => {
    if (!customer) return [];
    return invoices.filter(
      i => i.customerId === customer.id || i.customerCompany.toLowerCase() === customer.company.toLowerCase()
    );
  }, [invoices, customer]);

  const customerPayments = useMemo(() => {
    if (!customerInvoices) return [];
    return customerInvoices
      .filter(i => (i.paymentsReceived || 0) > 0)
      .map(i => ({
        id: `pay-${i.id}`,
        invoiceId: i.id,
        invoiceNumber: i.number,
        amount: i.paymentsReceived,
        method: (i as any).paymentMethod || 'Credit Card',
        status: 'SUCCEEDED',
        date: i.paidDate || i.issueDate,
        remainingBalance: i.remainingBalance,
      }));
  }, [customerInvoices]);

  const customerLeads = useMemo(() => {
    if (!customer) return [];
    return leads.filter(
      l => l.customerId === customer.id || l.name.toLowerCase() === customer.name.toLowerCase() || (l.company && l.company.toLowerCase() === customer.company.toLowerCase())
    );
  }, [leads, customer]);

  const customerAppointments = useMemo(() => {
    if (!customer) return [];
    return appointments.filter(
      a => a.customerId === customer.id || a.customerName.toLowerCase().includes(customer.name.toLowerCase())
    );
  }, [appointments, customer]);

  const customerJobs = useMemo(() => {
    if (!customer) return [];
    return jobs.filter(
      j => j.customerId === customer.id || j.customerName.toLowerCase().includes(customer.name.toLowerCase())
    );
  }, [jobs, customer]);

  const customerReviewRequests = useMemo(() => {
    if (!customer) return [];
    return reviewRequests.filter(
      r => r.customerId === customer.id || r.customerName.toLowerCase().includes(customer.name.toLowerCase())
    );
  }, [reviewRequests, customer]);

  const customerFeedbackList = useMemo(() => {
    if (!customer) return [];
    return customerFeedback.filter(
      f => f.customerId === customer.id || f.customerName.toLowerCase().includes(customer.name.toLowerCase())
    );
  }, [customerFeedback, customer]);

  const customerAvgRating = useMemo(() => {
    if (customerFeedbackList.length === 0) return null;
    const sum = customerFeedbackList.reduce((acc, f) => acc + f.rating, 0);
    return Math.round((sum / customerFeedbackList.length) * 10) / 10;
  }, [customerFeedbackList]);

  if (!customer) {
    return (
      <AppShell title="Customer Profile" showBack backUrl="/contacts">
        <div className="p-8 text-center bg-surface rounded-2xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Customer contact not found.</p>
        </div>
      </AppShell>
    );
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes(prev => `[${new Date().toLocaleDateString()}] ${newNote}\n` + prev);
    setNewNote('');
    showToast({ title: 'Note Logged', type: 'success' });
  };

  return (
    <AppShell
      title={customer.company}
      showBack
      backUrl="/contacts"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href={`/follow-up?customerName=${encodeURIComponent(customer.company)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-xs shadow-xs hover:bg-on-primary-fixed-variant transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Follow-up
          </Link>
          <Link
            href={`/invoices/create?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Invoice
          </Link>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Customer Header Card */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                {customer.company.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-on-surface">{customer.company}</h1>
                  <Badge risk={customer.riskLevel} />
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Primary Contact: <strong className="text-on-surface">{customer.name}</strong>
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-on-surface-variant">
                  <a href={`mailto:${customer.email}`} className="flex items-center gap-1 hover:text-primary">
                    <Mail className="w-3.5 h-3.5 text-outline" /> {customer.email}
                  </a>
                  <a href={`tel:${customer.phone}`} className="flex items-center gap-1 hover:text-primary">
                    <Phone className="w-3.5 h-3.5 text-outline" /> {customer.phone}
                  </a>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-outline" /> {customer.address}
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:text-right bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/60">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Credit Rating
              </p>
              <p className="text-xl font-bold text-primary">{customer.creditScore} / 850</p>
              <p className="text-[11px] text-tertiary font-semibold mt-0.5">Verified Account</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-outline-variant">
            <div className="p-3 bg-surface-container-low rounded-xl">
              <p className="text-[11px] text-on-surface-variant font-medium">Outstanding Balance</p>
              <p className={`text-lg font-bold mt-0.5 ${customer.totalOutstanding > 0 ? 'text-error' : 'text-on-surface'}`}>
                ${customer.totalOutstanding.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <p className="text-[11px] text-on-surface-variant font-medium">Lifetime Revenue</p>
              <p className="text-lg font-bold text-tertiary mt-0.5">
                ${customer.totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <p className="text-[11px] text-on-surface-variant font-medium">Active Jobs / Visits</p>
              <p className="text-lg font-bold text-on-surface mt-0.5">
                {customerJobs.length + customerAppointments.length}
              </p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <p className="text-[11px] text-on-surface-variant font-medium">Inquiries / Leads</p>
              <p className="text-lg font-bold text-primary mt-0.5">
                {customerLeads.length} Leads
              </p>
            </div>
          </div>
        </section>

        {/* Modular Lifecycle Tabs */}
        <div className="flex border-b border-outline-variant text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'invoices' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Invoices ({customerInvoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'payments' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payments ({customerPayments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'leads' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inquiries & Leads ({customerLeads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'appointments' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Appointments ({customerAppointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'jobs' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Work Orders ({customerJobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'border-primary text-primary font-bold' : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Reviews ({customerFeedbackList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span>Notes & Activity</span>
          </button>
        </div>

        {/* Tab Content: Invoices */}
        {activeTab === 'invoices' && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-sm text-on-surface">Invoice History</h2>
              <Link
                href={`/invoices/create?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}`}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Issue Invoice
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-outline-variant">
              {customerInvoices.length === 0 ? (
                <p className="text-xs text-on-surface-variant py-6 text-center">
                  No invoices found for this customer.
                </p>
              ) : (
                customerInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                    className="py-3 px-2 flex items-center justify-between hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-primary">{inv.number}</span>
                        <Badge status={inv.status} size="sm" />
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Issued {inv.issueDate} • Due {inv.dueDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-on-surface">
                        ${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <ChevronRight className="w-4 h-4 text-outline-variant" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Tab Content: Payments */}
        {activeTab === 'payments' && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-sm text-on-surface">Payment Ledger History</h2>
              <Link
                href="/payments"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View Full Ledger
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-outline-variant">
              {customerPayments.length === 0 ? (
                <p className="text-xs text-on-surface-variant py-6 text-center">
                  No payments recorded for this customer yet.
                </p>
              ) : (
                customerPayments.map((pay) => (
                  <div
                    key={pay.id}
                    onClick={() => router.push(`/invoices/${pay.invoiceId}`)}
                    className="py-3 px-2 flex items-center justify-between hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-on-surface">Invoice #{pay.invoiceNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {pay.status}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                        {pay.date} • {pay.method}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-sm font-bold font-mono text-emerald-600">
                          +${pay.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-mono">
                          Remaining: ${pay.remainingBalance.toFixed(2)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-outline-variant" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Tab Content: Leads */}
        {activeTab === 'leads' && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-sm text-on-surface">CRM Inquiries & Historical Leads</h2>
              <Link
                href={`/leads?action=create&name=${encodeURIComponent(customer.name)}&company=${encodeURIComponent(customer.company)}`}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Lead
              </Link>
            </div>

            {customerLeads.length === 0 ? (
              <p className="text-xs text-outline py-6 text-center">No previous CRM leads for this contact.</p>
            ) : (
              <div className="space-y-2">
                {customerLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    onClick={() => router.push(`/leads?leadId=${lead.id}`)}
                    className="p-3 rounded-xl border border-outline-variant hover:border-primary flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-on-surface">{lead.serviceRequested}</span>
                        <Badge status={lead.status as any} size="sm" />
                      </div>
                      <span className="text-[11px] text-outline">
                        Source: {lead.source} • Est. ${lead.estimatedValue.toLocaleString()}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-outline" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab Content: Appointments */}
        {activeTab === 'appointments' && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-sm text-on-surface">Service Appointments & Dispatch</h2>
              <Link
                href={`/appointments?action=create&customerName=${encodeURIComponent(customer.name)}&phone=${encodeURIComponent(customer.phone || '')}`}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Book Appointment
              </Link>
            </div>

            {customerAppointments.length === 0 ? (
              <p className="text-xs text-outline py-6 text-center">No appointments scheduled for this contact.</p>
            ) : (
              <div className="space-y-2">
                {customerAppointments.map((apt) => (
                  <div key={apt.id} className="p-3 rounded-xl border border-outline-variant flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-on-surface block">{apt.title}</span>
                      <span className="text-[11px] text-outline">{apt.startTime} • Technician: {apt.technicianName}</span>
                    </div>
                    <Badge status={apt.status as any} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab Content: Jobs */}
        {activeTab === 'jobs' && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-sm text-on-surface">Service Work Orders</h2>
              <Link
                href={`/jobs?action=create&customerName=${encodeURIComponent(customer.name)}&phone=${encodeURIComponent(customer.phone || '')}`}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Job
              </Link>
            </div>

            {customerJobs.length === 0 ? (
              <p className="text-xs text-outline py-6 text-center">No work orders recorded for this contact.</p>
            ) : (
              <div className="space-y-2">
                {customerJobs.map((j) => (
                  <div key={j.id} className="p-3 rounded-xl border border-outline-variant flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-on-surface block">{j.title}</span>
                      <span className="text-[11px] text-outline">
                        {j.serviceType} • Est. ${j.estimatedTotal} • Tech: {j.technicianName}
                      </span>
                    </div>
                    <Badge status={j.status as any} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab Content: Reviews & Feedback */}
        {activeTab === 'reviews' && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Customer Satisfaction & Feedback History
                </h2>
                {customerAvgRating && (
                  <span className="text-xs text-on-surface-variant mt-0.5 block">
                    Average Lifetime Rating: <strong className="text-amber-600 font-bold">{customerAvgRating} ★</strong> across {customerFeedbackList.length} reviews
                  </span>
                )}
              </div>
              <Link
                href={`/reputation/requests?action=send&customerId=${customer.id}`}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Send Survey
              </Link>
            </div>

            {customerFeedbackList.length === 0 ? (
              <div className="py-8 text-center text-outline">
                <Star className="w-8 h-8 mx-auto text-outline-variant mb-1.5" />
                <p className="text-xs font-medium">No reviews logged for this client yet.</p>
                <p className="text-[11px] mt-0.5">Surveys are automatically dispatched upon work order completion.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerFeedbackList.map((fb) => (
                  <div key={fb.id} className="p-4 rounded-xl border border-outline-variant bg-surface-container-low/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                          fb.rating >= 4 ? 'bg-emerald-500/15 text-emerald-700' : 'bg-rose-500/15 text-rose-700'
                        }`}>
                          {fb.rating} ★
                        </span>
                        <span className="text-xs font-bold text-on-surface">{fb.jobTitle || 'Service Call'}</span>
                      </div>
                      <Badge followUpStatus={fb.followUpStatus} size="sm" />
                    </div>

                    {fb.feedbackText && (
                      <p className="text-xs text-on-surface leading-relaxed italic bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant">
                        &quot;{fb.feedbackText}&quot;
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-outline pt-1">
                      <span>Tech: <strong className="text-on-surface">{fb.technicianName || 'Team'}</strong></span>
                      <span>Recorded on {new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab Content: Notes & Activity */}
        {activeTab === 'notes' && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="font-bold text-sm text-on-surface">Communication & Account Notes</h2>
            <form onSubmit={handleAddNote} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Log a call, service preference, or accounts note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Add Note
                </Button>
              </div>
            </form>

            <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 text-xs text-on-surface-variant whitespace-pre-line font-mono">
              {notes || 'No activity notes logged yet.'}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
