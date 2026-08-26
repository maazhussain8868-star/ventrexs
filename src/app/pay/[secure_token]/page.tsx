'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  FileText,
  Calendar,
  Receipt,
  Download,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getPublicInvoiceByPaymentTokenAction, processPublicPaymentAction } from '@/app/actions/payments';
import { PublicInvoicePaymentView } from '@/lib/payments/types';

export default function PublicInvoicePaymentPage() {
  const params = useParams();
  const secureToken = params.secure_token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceView, setInvoiceView] = useState<PublicInvoicePaymentView | null>(null);

  // Payment form state
  const [payAmount, setPayAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'ACH Transfer'>('Credit Card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      setLoading(true);
      try {
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || secureToken.startsWith('pay_demo')) {
          // Demo fallback view
          const demoView: PublicInvoicePaymentView = {
            secureToken,
            invoiceId: 'inv-demo-001',
            invoiceNumber: 'INV-2026-882',
            businessName: 'Apex Precision HVAC & Electrical',
            businessEmail: 'service@apexhvac.com',
            businessPhone: '+1 (555) 234-8900',
            customerName: 'Robert Vance',
            customerEmail: 'robert@vancerefrigeration.com',
            customerCompany: 'Vance Refrigeration LLC',
            items: [
              { description: 'Commercial Rooftop HVAC Compressor Replacement', quantity: 1, unitPrice: 3850, total: 3850 },
              { description: 'High-Efficiency Refrigerant R-410A Recharge (15 lbs)', quantity: 15, unitPrice: 45, total: 675 },
              { description: 'Electrical Contactor & Dual Run Capacitor Overhaul', quantity: 1, unitPrice: 325, total: 325 },
            ],
            subtotal: 4850,
            taxAmount: 0,
            totalAmount: 4850,
            amountPaid: 1500,
            remainingBalance: 3350,
            dueDate: 'September 15, 2026',
            status: 'partially_paid',
            isExpired: false,
          };
          setInvoiceView(demoView);
          setPayAmount(demoView.remainingBalance.toString());
          setLoading(false);
          return;
        }

        const res = await getPublicInvoiceByPaymentTokenAction(secureToken);
        if (!res.success || !res.data) {
          setError(res.error || 'Invoice not found or link has expired.');
        } else {
          setInvoiceView(res.data);
          setPayAmount(res.data.remainingBalance.toString());
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load invoice payment portal.');
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [secureToken]);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(payAmount);

    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    if (invoiceView && numAmount > invoiceView.remainingBalance + 0.001) {
      alert(`Payment cannot exceed the remaining balance of $${invoiceView.remainingBalance.toFixed(2)}.`);
      return;
    }

    setIsProcessing(true);

    try {
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || secureToken.startsWith('pay_demo')) {
        setTimeout(() => {
          setPaymentSuccess({
            transactionId: `txn_demo_${Date.now()}`,
            amount: numAmount,
            remainingBalance: Math.max(0, (invoiceView?.remainingBalance || 0) - numAmount),
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          });
          setIsProcessing(false);
        }, 1200);
        return;
      }

      const res = await processPublicPaymentAction({
        secureToken,
        amount: numAmount,
        paymentMethod,
        reference: `WEB_PORTAL_${Date.now()}`,
      });

      if (!res.success) {
        alert(res.error || 'Payment failed. Please verify your card details.');
        setIsProcessing(false);
        return;
      }

      setPaymentSuccess({
        transactionId: res.data?.payment?.reference || res.data?.payment?.id,
        amount: numAmount,
        remainingBalance: Number(res.data?.invoice?.remaining_balance || 0),
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      });
    } catch (err: any) {
      alert(err.message || 'An error occurred while submitting payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-on-surface">Loading Secure Payment Portal...</p>
        </div>
      </div>
    );
  }

  if (error || !invoiceView) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-container-low border border-outline-variant rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-on-surface">Payment Link Unavailable</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {error || 'This invoice payment link may have expired or is no longer valid. Please contact your contractor for an updated link.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low py-8 px-4 sm:px-6 lg:px-8 font-sans text-on-surface">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Branding Bar */}
        <header className="bg-surface-container-lowest border border-outline-variant/70 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-extrabold tracking-tight text-on-surface">
                {invoiceView.businessName}
              </h1>
            </div>
            <p className="text-xs text-on-surface-variant">
              {invoiceView.businessEmail} {invoiceView.businessPhone && `• ${invoiceView.businessPhone}`}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold self-start sm:self-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit Encrypted Checkout</span>
          </div>
        </header>

        {/* Success Confirmation Screen */}
        {paymentSuccess ? (
          <div className="bg-surface-container-lowest border border-emerald-500/30 rounded-2xl p-8 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Payment Completed Successfully
              </span>
              <h2 className="text-3xl font-black font-mono text-on-surface">
                ${paymentSuccess.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Applied to Invoice #{invoiceView.invoiceNumber} on {paymentSuccess.date}
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 bg-surface-container-low rounded-xl border border-outline-variant/60 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Transaction Ref:</span>
                <span className="font-mono font-bold text-on-surface">{paymentSuccess.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Original Invoice Total:</span>
                <span className="font-mono font-bold text-on-surface">${invoiceView.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-outline-variant/40 pt-1.5 font-bold">
                <span>Remaining Balance Due:</span>
                <span className={`font-mono ${paymentSuccess.remainingBalance <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ${paymentSuccess.remainingBalance.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Download className="w-4 h-4" />}
                className="text-xs"
              >
                Print Official Receipt
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Invoice Line Items Summary (Left 3 cols) */}
            <div className="md:col-span-3 space-y-6">
              <section className="bg-surface-container-lowest border border-outline-variant/70 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/50">
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                      Invoice
                    </span>
                    <h3 className="text-lg font-bold text-on-surface">#{invoiceView.invoiceNumber}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                      Due Date
                    </span>
                    <span className="text-xs font-bold text-on-surface">{invoiceView.dueDate}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-bold text-on-surface">Billed To:</p>
                  <p className="text-on-surface font-semibold">{invoiceView.customerCompany || invoiceView.customerName}</p>
                  <p className="text-on-surface-variant">{invoiceView.customerEmail}</p>
                </div>

                {/* Items Table */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-on-surface uppercase tracking-wider">Completed Deliverables</p>
                  <div className="divide-y divide-outline-variant/40 border-y border-outline-variant/40 text-xs">
                    {invoiceView.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-on-surface">{item.description}</p>
                          <p className="text-[11px] text-on-surface-variant">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                        </div>
                        <span className="font-mono font-bold text-on-surface">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ledger Invariant Breakdown */}
                <div className="space-y-1.5 pt-2 text-xs">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Original Invoice Total:</span>
                    <span className="font-mono font-semibold">${invoiceView.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Payments Already Applied:</span>
                    <span className="font-mono">-${invoiceView.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-outline-variant/60 text-sm font-black text-on-surface">
                    <span>Remaining Balance Owed:</span>
                    <span className="font-mono text-primary text-base">
                      ${invoiceView.remainingBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </section>

              {/* Halal Guarantee Badge */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/70 text-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-on-surface">Transparent Honest Billing</p>
                  <p className="text-[11px] text-on-surface-variant">
                    Ventrexs guarantees exact arithmetic. 0% interest, 0% late fees, and zero hidden charges.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Checkout Panel (Right 2 cols) */}
            <div className="md:col-span-2 space-y-6">
              <section className="bg-surface-container-lowest border border-primary/30 rounded-2xl p-6 shadow-md space-y-5 sticky top-6">
                <div className="space-y-1 pb-3 border-b border-outline-variant/50">
                  <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" /> Pay Online
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">Instant settlement confirmation</p>
                </div>

                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  {/* Amount Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface flex justify-between">
                      <span>Payment Amount ($)</span>
                      <button
                        type="button"
                        onClick={() => setPayAmount(invoiceView.remainingBalance.toString())}
                        className="text-[11px] font-bold text-primary hover:underline"
                      >
                        Pay Full Balance
                      </button>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max={invoiceView.remainingBalance}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-3 py-2 text-base font-mono font-bold text-on-surface focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  {/* Payment Method Tabs */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Credit Card')}
                        className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'Credit Card'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-outline-variant text-on-surface-variant'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('ACH Transfer')}
                        className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'ACH Transfer'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-outline-variant text-on-surface-variant'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" /> Bank ACH
                      </button>
                    </div>
                  </div>

                  {/* Card Simulation Inputs */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-2.5 py-1.5 font-mono text-on-surface"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">
                          Expiration
                        </label>
                        <input
                          type="text"
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-2.5 py-1.5 font-mono text-on-surface"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-2.5 py-1.5 font-mono text-on-surface"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={isProcessing}
                    className="w-full text-xs font-bold py-3 mt-2"
                  >
                    {isProcessing ? 'Processing Secure Payment...' : `Authorize & Pay $${parseFloat(payAmount || '0').toFixed(2)}`}
                  </Button>
                </form>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
