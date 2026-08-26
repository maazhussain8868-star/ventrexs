'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Building2,
  Sparkles,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { initiateDemoAccessRequestAction, getDemoRequestStatusAction } from '@/app/actions/demo-access';

export default function DemoTokenAccessPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const rawToken = resolvedParams.token;
  const router = useRouter();

  const [step, setStep] = useState<'FORM' | 'WAITING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'>('FORM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [approvalsCount, setApprovalsCount] = useState(0);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and work email.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await initiateDemoAccessRequestAction({
      rawToken,
      requesterName: name.trim(),
      requesterEmail: email.trim(),
      requesterCompany: company.trim() || undefined,
    });

    setLoading(false);

    if (!res.success || !res.data?.request) {
      setError(res.error || 'Failed to submit demo access request.');
      if (res.error?.includes('expired') || res.error?.includes('Invalid')) {
        setStep('EXPIRED');
      }
      return;
    }

    setRequestId(res.data.request.id);
    setApprovalsCount(res.data.request.approvalsCount);
    setStep('WAITING');
  };

  // Poll for approval status every 3 seconds while in WAITING state
  useEffect(() => {
    if (step !== 'WAITING' || !requestId) return;

    const interval = setInterval(async () => {
      const res = await getDemoRequestStatusAction(requestId, rawToken);
      if (res.success && res.data?.request) {
        const req = res.data.request;
        setApprovalsCount(req.approvalsCount);

        if (req.approvalStatus === 'APPROVED' && res.data.sessionToken) {
          setSessionToken(res.data.sessionToken);
          setStep('APPROVED');
          clearInterval(interval);
        } else if (req.approvalStatus === 'REJECTED') {
          setRejectionReason(req.rejectionReason || 'Demo request declined by administrator.');
          setStep('REJECTED');
          clearInterval(interval);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, requestId, rawToken]);

  const handleLaunchDemo = () => {
    // In production, session cookie is set server-side; we route to demo dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> Dual-Approval Demo Gate
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-on-surface">
            Ventrexs AI <span className="text-primary">Live Demo Access</span>
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto">
            Authorized production demonstration with strict two-person owner verification and tenant isolation.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: INITIAL REQUEST FORM */}
          {step === 'FORM' && (
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex@enterprise-hvac.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface">Company / Business Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Morgan HVAC & Plumbing"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="p-3 bg-surface-container-high rounded-xl border border-outline-variant/20 space-y-1.5 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Lock className="w-3.5 h-3.5" /> 2-Person Verification Gate
                </div>
                <p className="text-[11px] leading-relaxed">
                  To protect proprietary field automation algorithms and ensure compliant access, this demo link requires authorization from two distinct platform owners before access is granted.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full text-xs font-bold"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Request Live Demo Access
              </Button>
            </form>
          )}

          {/* STEP 2: WAITING FOR DUAL APPROVAL */}
          {step === 'WAITING' && (
            <div className="text-center space-y-6 py-2">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto text-primary animate-pulse">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-on-surface">Awaiting Dual Owner Approval</h3>
                <p className="text-xs text-on-surface-variant">
                  We have notified both authorized platform owners. Access will unlock automatically once both approve.
                </p>
              </div>

              {/* Progress Indicators */}
              <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Approval Progress</span>
                  <span className={approvalsCount >= 2 ? 'text-emerald-600' : 'text-primary'}>
                    {approvalsCount} of 2 Owners Approved
                  </span>
                </div>

                <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500 rounded-full"
                    style={{ width: `${(approvalsCount / 2) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      approvalsCount >= 1
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold'
                        : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant'
                    }`}
                  >
                    {approvalsCount >= 1 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                    )}
                    <span>Owner 1: {approvalsCount >= 1 ? 'Approved' : 'Pending'}</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      approvalsCount >= 2
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold'
                        : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant'
                    }`}
                  >
                    {approvalsCount >= 2 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-on-surface-variant" />
                    )}
                    <span>Owner 2: {approvalsCount >= 2 ? 'Approved' : 'Pending'}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-on-surface-variant flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin text-primary" /> Polling server for real-time approval status...
              </p>
            </div>
          )}

          {/* STEP 3: APPROVED STATE */}
          {step === 'APPROVED' && (
            <div className="text-center space-y-6 py-2">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
                  2 / 2 Approvals Confirmed
                </div>
                <h3 className="text-lg font-bold text-on-surface">Demo Session Authorized!</h3>
                <p className="text-xs text-on-surface-variant">
                  Your short-lived authenticated demo session has been provisioned for the isolated Apex HVAC demo tenant.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleLaunchDemo}
                className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Launch Demo Dashboard
              </Button>
            </div>
          )}

          {/* REJECTED STATE */}
          {step === 'REJECTED' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
                <XCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-on-surface">Demo Access Request Declined</h3>
              <p className="text-xs text-on-surface-variant">{rejectionReason}</p>
              <Link href="/" className="inline-block text-xs text-primary font-bold hover:underline">
                Return to Homepage
              </Link>
            </div>
          )}

          {/* EXPIRED STATE */}
          {step === 'EXPIRED' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-on-surface">Demo Invitation Expired</h3>
              <p className="text-xs text-on-surface-variant">
                This demo token has exceeded its 24-hour validity window or was revoked by an administrator.
              </p>
              <Link href="/pricing" className="inline-block text-xs text-primary font-bold hover:underline">
                View Subscription Plans
              </Link>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-on-surface-variant">
          Protected by Ventrexs AI Multi-Tenant Cryptographic Guard &copy; {new Date().getFullYear()} Desynthic
        </div>
      </div>
    </div>
  );
}
