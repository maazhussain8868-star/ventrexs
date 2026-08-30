'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Wrench,
  Clock,
  ShieldCheck,
  Plus,
  X,
  User,
  CreditCard,
  Zap,
  Check,
} from 'lucide-react';
import { IndustryType } from '@/types';
import { PLANS_CONFIG, PlanKey } from '@/lib/billing/types';
import { Button } from '@/components/ui/Button';

const INDUSTRY_OPTIONS: { id: IndustryType; label: string; icon: string }[] = [
  { id: 'HVAC', label: 'HVAC & Heating', icon: 'hvac' },
  { id: 'Plumbing', label: 'Plumbing & Drains', icon: 'plumbing' },
  { id: 'Electrical', label: 'Electrical & Power', icon: 'electric_bolt' },
  { id: 'Roofing', label: 'Roofing & Siding', icon: 'roofing' },
  { id: 'Cleaning', label: 'Commercial & Home Cleaning', icon: 'cleaning_services' },
  { id: 'Landscaping', label: 'Landscaping & Tree Care', icon: 'yard' },
  { id: 'General Contractor', label: 'General Contractor', icon: 'construction' },
  { id: 'Concrete', label: 'Concrete & Masonry', icon: 'foundation' },
  { id: 'Garage Door', label: 'Garage Door Services', icon: 'garage' },
  { id: 'Pest Control', label: 'Pest Control Services', icon: 'pest_control' },
  { id: 'Other', label: 'Other Trade Business', icon: 'engineering' },
];

const DEFAULT_SERVICES_BY_INDUSTRY: Record<string, string[]> = {
  HVAC: ['AC Diagnostic & Repair', 'Heating Installation', 'Duct Inspection & Cleaning', 'Emergency Triage', 'Seasonal Tune-up'],
  Plumbing: ['Drain Snaking & Clearing', 'Water Heater Replacement', 'Leak Detection & Pipe Repair', 'Emergency Plumbing', 'Fixture Installation'],
  Electrical: ['Panel Upgrade & Replacement', 'Lighting & Outlet Wiring', 'EV Charger Installation', 'Electrical Inspection', 'Emergency Service'],
  Roofing: ['Roof Replacement', 'Shingle & Leak Repair', 'Storm Damage Assessment', 'Gutter Installation', 'Commercial Flat Roof'],
  Cleaning: ['Deep Commercial Cleaning', 'Move-in / Move-out Cleaning', 'Carpet & Upholstery', 'Post-Construction Cleaning', 'Window Washing'],
  Landscaping: ['Lawn Maintenance & Mowing', 'Landscape Design & Installation', 'Tree Trimming & Removal', 'Irrigation & Drainage', 'Hardscaping'],
  Construction: ['Full Home Renovation', 'Kitchen & Bathroom Remodel', 'Framing & Drywall', 'Custom Additions', 'Structural Repair'],
  'General Contractor': ['General Contracting', 'Subcontractor Management', 'Permit & Code Compliance', 'Commercial Build-out', 'Residential Remodeling'],
  Concrete: ['Driveway & Patio Pouring', 'Foundation Repair', 'Stamped Concrete', 'Retaining Walls', 'Sidewalk Masonry'],
  'Garage Door': ['Spring & Cable Replacement', 'Garage Door Opener Installation', 'Emergency Off-Track Repair', 'New Door Installation', 'Tune-up'],
  'Pest Control': ['Termite Treatment', 'Rodent Exclusion', 'Mosquito Control', 'Quarterly Pest Shield', 'Bed Bug Heat Treatment'],
  Other: ['Standard Diagnostics', 'Field Service Dispatch', 'Emergency Call-out', 'Preventative Maintenance', 'Consultation'],
};

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const { user, profile, businessProfile, completeOnboarding, showToast } = useApp();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STEP 1 — About You
  const [ownerName, setOwnerName] = useState(profile?.name || (user?.user_metadata?.name as string) || '');
  const [ownerEmail, setOwnerEmail] = useState(profile?.email || user?.email || '');
  const [ownerPhone, setOwnerPhone] = useState(businessProfile?.phone || '');
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState('');

  // STEP 2 — Your Business
  const [businessName, setBusinessName] = useState(
    businessProfile?.name || profile?.businessName || (user?.user_metadata?.business_name as string) || ''
  );
  const [industry, setIndustry] = useState<IndustryType>(businessProfile?.industry || 'General Contractor');
  const [businessType, setBusinessType] = useState('Independent Contractor');
  const [website, setWebsite] = useState(businessProfile?.website || '');
  const [businessAddress, setBusinessAddress] = useState(businessProfile?.address || '');

  // Sync profile when loaded asynchronously
  useEffect(() => {
    if (profile?.name && !ownerName) setOwnerName(profile.name);
    if ((profile?.email || user?.email) && !ownerEmail) setOwnerEmail(profile?.email || user?.email || '');
    if ((businessProfile?.name || profile?.businessName) && !businessName) {
      setBusinessName(businessProfile?.name || profile?.businessName || '');
    }
  }, [profile, businessProfile, user, ownerName, ownerEmail, businessName]);

  // STEP 3 — Services
  const [services, setServices] = useState<string[]>(
    DEFAULT_SERVICES_BY_INDUSTRY[industry] || DEFAULT_SERVICES_BY_INDUSTRY['General Contractor'] || []
  );
  const [newServiceInput, setNewServiceInput] = useState('');

  // STEP 4 — Choose Plan
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('Professional');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Update suggested services when industry changes
  const handleIndustryChange = (newInd: IndustryType) => {
    setIndustry(newInd);
    const suggested = DEFAULT_SERVICES_BY_INDUSTRY[newInd] || DEFAULT_SERVICES_BY_INDUSTRY.Other;
    setServices(suggested);
  };

  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    if (!services.includes(newServiceInput.trim())) {
      setServices([...services, newServiceInput.trim()]);
    }
    setNewServiceInput('');
  };

  const handleRemoveService = (service: string) => {
    setServices(services.filter((s) => s !== service));
  };

  const handleNextStep = () => {
    if (step === 1 && (!ownerName || !ownerEmail)) {
      showToast({ title: 'Missing Info', description: 'Please provide your name and email.', type: 'error' });
      return;
    }
    if (step === 2 && !businessName) {
      showToast({ title: 'Missing Info', description: 'Please enter your business name.', type: 'error' });
      return;
    }
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      completeOnboarding({
        name: businessName,
        industry,
        phone: ownerPhone,
        email: ownerEmail,
        website,
        serviceAreas: [city],
        services,
        businessHours: {
          monday: { open: '08:00', close: '17:00', closed: false },
          tuesday: { open: '08:00', close: '17:00', closed: false },
          wednesday: { open: '08:00', close: '17:00', closed: false },
          thursday: { open: '08:00', close: '17:00', closed: false },
          friday: { open: '08:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '14:00', closed: false },
          sunday: { open: '09:00', close: '14:00', closed: true },
        },
        timezone: 'America/Chicago',
        about: `${businessName} provides licensed ${industry} services in ${city}.`,
      });

      showToast({
        title: 'Workspace Initialized',
        description: 'Your workspace is ready. Choose a plan to activate it.',
        type: 'success',
      });

      // Direct to billing — subscription must be active before accessing dashboard
      router.push('/billing');
    } catch (err: any) {
      showToast({
        title: 'Setup Notice',
        description: err.message || 'Workspace created. Choose a plan to get started.',
        type: 'info',
      });
      router.push('/billing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight">Ventrexs AI</span>
            <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase ml-1.5 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Business Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 font-mono">
            Step {step} of 5
          </span>
          <button
            onClick={() => router.push('/billing')}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-10 max-w-2xl mx-auto w-full">
        {/* Step Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
              {step === 1 && 'Step 1: About You'}
              {step === 2 && 'Step 2: Your Business'}
              {step === 3 && 'Step 3: Trade Services'}
              {step === 4 && 'Step 4: Choose Plan'}
              {step === 5 && 'Step 5: Launch Workspace'}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              {Math.round((step / 5) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full w-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Body Card */}
        <div className="flex-1 flex flex-col justify-between bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xs min-w-0">
          {/* ============================================================ */}
          {/* STEP 1: ABOUT YOU */}
          {/* ============================================================ */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Welcome! Let's start with your contact profile
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  This identity will be assigned as the primary workspace owner and emergency point of contact.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Owner Full Name *</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[38px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Owner Email *</label>
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[38px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Direct Phone *</label>
                    <input
                      type="text"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[38px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[38px]"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="India">India</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">City / Region</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Austin, TX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[38px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: YOUR BUSINESS */}
          {/* ============================================================ */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Tell us about your business
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  We customize invoice templates, CRM pipelines, and AI reception for your trade.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Comfort HVAC & Plumbing"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[38px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Primary Trade / Industry *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                    {INDUSTRY_OPTIONS.map((ind) => (
                      <button
                        key={ind.id}
                        type="button"
                        onClick={() => handleIndustryChange(ind.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 min-h-[44px] ${
                          industry === ind.id
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs truncate">{ind.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Business Website (Optional)</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://apexcomfort.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[38px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Business Address (Optional)</label>
                    <input
                      type="text"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="100 Main St, Suite 200"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[38px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: SERVICES */}
          {/* ============================================================ */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  What services do you offer?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  These services will be suggested automatically when creating estimates and dispatching jobs.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Add new service form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newServiceInput}
                    onChange={(e) => setNewServiceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                    placeholder="Add custom service (e.g., Emergency Drain Snaking)"
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[38px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddService}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="text-xs bg-white text-slate-700 min-h-[38px]"
                  >
                    Add
                  </Button>
                </div>

                {/* Service Tag Pills */}
                <div className="flex flex-wrap gap-2 pt-1 max-h-56 overflow-y-auto">
                  {services.map((srv, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                    >
                      <Wrench className="w-3 h-3 text-blue-500" />
                      <span>{srv}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(srv)}
                        className="hover:text-red-600 transition-colors ml-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: CHOOSE PLAN */}
          {/* ============================================================ */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Select your subscription tier
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Start with a 14-day free trial. No charges until your trial concludes.
                  </p>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all min-h-[32px] ${
                      billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all min-h-[32px] ${
                      billingCycle === 'annual' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Annual (2 mo free)
                  </button>
                </div>
              </div>

              {/* Plan Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Starter', 'Professional', 'Enterprise'] as PlanKey[]).map((pKey) => {
                  const p = PLANS_CONFIG[pKey];
                  const isSelected = selectedPlan === pKey;
                  const price = billingCycle === 'monthly' ? p.priceMonthly : Math.round(p.priceAnnual / 12);

                  return (
                    <div
                      key={pKey}
                      onClick={() => setSelectedPlan(pKey)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-blue-50/60 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                          : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-900">{p.name}</span>
                          {p.popular && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 font-mono">${price}</span>
                          <span className="text-xs text-slate-500">/mo</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{p.tagline}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 text-[11px] space-y-1 text-slate-600">
                        {p.features.slice(0, 3).map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 5: FINISH SETUP & GUIDED LAUNCH */}
          {/* ============================================================ */}
          {step === 5 && (
            <div className="space-y-5 text-center py-2 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/25">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Ready to Launch
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Your Ventrexs workspace is ready!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  <strong>{businessName}</strong> has been configured with AI receptionist triage, custom invoice templates, and your selected <strong>{selectedPlan}</strong> plan.
                </p>
              </div>

              {/* First-time guided quick checklist */}
              <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2.5 text-xs">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                  Recommended First Steps:
                </span>
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">1</div>
                  <span>Create your first contractor invoice or customer quote</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">2</div>
                  <span>Test the 24/7 AI Voice Receptionist simulation</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">3</div>
                  <span>Invite your crew or field technicians</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                className="text-xs min-h-[38px]"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNextStep}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold min-h-[38px]"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleFinishOnboarding}
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold min-h-[42px] px-6 shadow-md"
              >
                Enter Dashboard
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
