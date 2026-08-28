'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Building2,
  User,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AGENCY_PLANS_CONFIG } from '@/lib/billing/types';

export default function AgencyOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STEP 1 — Agency Information
  const [agencyName, setAgencyName] = useState('Apex Marketing & Reseller Group');
  const [website, setWebsite] = useState('https://apexgroup.agency');
  const [brandColor, setBrandColor] = useState('#4f46e5');

  // STEP 2 — Owner Information
  const [ownerName, setOwnerName] = useState('Alex Rivera');
  const [ownerEmail, setOwnerEmail] = useState('alex@apexgroup.agency');
  const [ownerPhone, setOwnerPhone] = useState('+1 (555) 789-0123');

  // STEP 3 — Target Market
  const [targetMarket, setTargetMarket] = useState<string[]>([
    'HVAC & Air Conditioning',
    'Plumbing & Drains',
    'Roofing & Siding',
  ]);

  // STEP 4 — Team Size & Reseller Tier
  const [teamSize, setTeamSize] = useState('6-20 operators');
  const [resellerTier, setResellerTier] = useState('Agency Growth');

  // STEP 5 — Reseller Configuration
  const [subdomain, setSubdomain] = useState('apex-portal');
  const [customDomain, setCustomDomain] = useState('portal.apexgroup.agency');
  const [markupPercent, setMarkupPercent] = useState(30);

  const marketOptions = [
    'HVAC & Air Conditioning',
    'Plumbing & Drains',
    'Electrical & Solar',
    'Roofing & Siding',
    'Commercial Cleaning',
    'General Contracting & Remodeling',
    'Landscaping & Lawn',
    'Multi-Unit Property Maintenance',
  ];

  const toggleMarket = (market: string) => {
    if (targetMarket.includes(market)) {
      setTargetMarket(targetMarket.filter((m) => m !== market));
    } else {
      setTargetMarket([...targetMarket, market]);
    }
  };

  const handleNext = () => {
    if (step === 1 && !agencyName.trim()) {
      alert('Please enter your agency organization name.');
      return;
    }
    if (step === 2 && (!ownerName.trim() || !ownerEmail.trim())) {
      alert('Please enter your lead contact information.');
      return;
    }
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handleFinishAgencyOnboarding = async () => {
    setIsSubmitting(true);
    try {
      // Simulate/Trigger Agency Workspace provisioning
      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/agency');
      }, 1000);
    } catch {
      setIsSubmitting(false);
      router.push('/agency');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-indigo-600/30 selection:text-indigo-200">
      {/* Background glow pool */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[140px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 sm:px-8 py-3.5 bg-[#0B1220]/90 backdrop-blur-md border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-base text-white tracking-tight">Ventrexs</span>
            <span className="text-[10px] font-bold text-violet-400 tracking-wider uppercase ml-1.5 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-800/60">
              Agency Partner Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 font-mono">
            Step {step} of 6
          </span>
          <button
            onClick={() => router.push('/agency')}
            className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
          >
            Skip to Agency Command
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-10 max-w-2xl mx-auto w-full">
        {/* Step Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-extrabold text-violet-400 uppercase tracking-wider">
              {step === 1 && 'Step 1: Agency Information'}
              {step === 2 && 'Step 2: Owner Information'}
              {step === 3 && 'Step 3: Target Verticals'}
              {step === 4 && 'Step 4: Scale & Reseller Tier'}
              {step === 5 && 'Step 5: White-Label Configuration'}
              {step === 6 && 'Step 6: Deploy Agency Node'}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              {Math.round((step / 6) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full w-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Body Card */}
        <div className="flex-1 flex flex-col justify-between bg-[#0B1220] border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl min-w-0">
          {/* STEP 1: Agency Information */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Let's configure your marketing agency profile
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  This identity powers your client management dashboard and custom white-label client portals.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Agency Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="e.g. Apex Reseller Partners"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 min-h-[40px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Agency Website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://apexgroup.agency"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Brand Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-10 h-10 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono min-h-[40px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Owner Information */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Lead Partner & Administrator Contact
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Primary account holder with full authority over billing, client provisioning, and custom domains.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Partner Full Name *</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Partner Work Email *</label>
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="alex@apexgroup.agency"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 min-h-[40px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Partner Phone</label>
                  <input
                    type="text"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="+1 (555) 789-0123"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 min-h-[40px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Target Verticals */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  What service verticals do you manage?
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Select the trade industries you plan to onboard into your white-labeled Ventrexs cluster.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {marketOptions.map((m, idx) => {
                  const isSelected = targetMarket.includes(m);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleMarket(m)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between min-h-[44px] ${
                        isSelected
                          ? 'bg-violet-600/20 border-violet-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <span className="text-xs">{m}</span>
                      {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Scale & Reseller Tier */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Agency Scale & Reseller Plan
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Choose the provisioning capacity needed for your team and initial client rollout.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { tier: 'Agency Starter', seats: '1-5 operators', clients: 'Up to 10 Clients', mrr: `$${AGENCY_PLANS_CONFIG.AgencyStarter.priceMonthly}` },
                  { tier: 'Agency Growth', seats: '6-20 operators', clients: 'Up to 50 Clients', mrr: `$${AGENCY_PLANS_CONFIG.AgencyGrowth.priceMonthly}`, popular: true },
                  { tier: 'Agency Enterprise', seats: '20+ operators', clients: 'Unlimited Clients', mrr: `$${AGENCY_PLANS_CONFIG.AgencyEnterprise.priceMonthly}` },
                ].map((t, idx) => {
                  const isSelected = resellerTier === t.tier;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setResellerTier(t.tier);
                        setTeamSize(t.seats);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-violet-600/20 border-violet-500 shadow-lg ring-1 ring-violet-500'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-white">{t.tier}</span>
                          {t.popular && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-violet-600 text-white uppercase">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-white font-mono">{t.mrr}</span>
                          <span className="text-[10px] text-slate-400">/mo</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{t.clients}</p>
                        <p className="text-[10px] text-slate-500">{t.seats}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: White-Label Configuration */}
          {step === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  White-Label Domain & Subdomain
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Your clients log in through your custom branded URL with zero Ventrexs branding visible.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Reseller Subdomain *</label>
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden min-h-[40px]">
                    <input
                      type="text"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="flex-1 px-3.5 py-2 bg-transparent text-white font-mono outline-none"
                    />
                    <span className="px-3 py-2 text-slate-400 font-mono text-xs bg-slate-800/80 border-l border-slate-700">
                      .ventrexs.com
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Custom White-Label CNAME Domain</label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="portal.youragency.com"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 min-h-[40px]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Point your CNAME to <code className="text-violet-400">cname.ventrexs.com</code> for auto-provisioned SSL.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Workspace Creation / Launch */}
          {step === 6 && (
            <div className="space-y-5 text-center py-2 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-950/80 px-3 py-1 rounded-full border border-violet-800/60">
                  Cluster Configured
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Your Agency Node is Ready!
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                  <strong>{agencyName}</strong> has been provisioned on the <strong>{resellerTier}</strong> tier with white-label URL <code className="text-violet-300">{subdomain}.ventrexs.com</code>.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-left space-y-2 text-xs">
                <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                  Next Agency Milestones:
                </span>
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-violet-900/60 text-violet-300 flex items-center justify-center font-bold text-[10px] shrink-0">1</div>
                  <span>Provision your first client contractor tenant</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-violet-900/60 text-violet-300 flex items-center justify-center font-bold text-[10px] shrink-0">2</div>
                  <span>Verify your custom CNAME SSL in Agency Domains</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-violet-900/60 text-violet-300 flex items-center justify-center font-bold text-[10px] shrink-0">3</div>
                  <span>Set client markup & automated recurring subscriptions</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800 min-h-[40px]"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="text-xs bg-violet-600 hover:bg-violet-500 text-white font-bold min-h-[40px]"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleFinishAgencyOnboarding}
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold min-h-[44px] px-6 shadow-lg shadow-indigo-600/30"
              >
                Launch Agency Command
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
