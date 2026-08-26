'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
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
  X
} from 'lucide-react';
import { IndustryType, BusinessHours } from '@/types';

const INDUSTRY_OPTIONS: { id: IndustryType; label: string; icon: string }[] = [
  { id: 'HVAC', label: 'HVAC & Air Conditioning', icon: 'hvac' },
  { id: 'Roofing', label: 'Roofing & Siding', icon: 'roofing' },
  { id: 'Plumbing', label: 'Plumbing & Drains', icon: 'plumbing' },
  { id: 'Electrical', label: 'Electrical Services', icon: 'electric_bolt' },
  { id: 'Concrete', label: 'Concrete & Masonry', icon: 'foundation' },
  { id: 'General Contractor', label: 'General Contractor', icon: 'construction' },
  { id: 'Landscaping', label: 'Landscaping & Tree Care', icon: 'yard' },
  { id: 'Garage Door', label: 'Garage Door Services', icon: 'garage' },
  { id: 'Pest Control', label: 'Pest Control', icon: 'pest_control' },
  { id: 'Cleaning', label: 'Commercial / Home Cleaning', icon: 'cleaning_services' },
  { id: 'Other', label: 'Other Service Business', icon: 'handyman' },
];

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: '08:00', close: '17:00', closed: false },
  tuesday: { open: '08:00', close: '17:00', closed: false },
  wednesday: { open: '08:00', close: '17:00', closed: false },
  thursday: { open: '08:00', close: '17:00', closed: false },
  friday: { open: '08:00', close: '17:00', closed: false },
  saturday: { open: '09:00', close: '14:00', closed: false },
  sunday: { open: '09:00', close: '14:00', closed: true },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { businessProfile, completeOnboarding, showToast } = useApp();

  const [step, setStep] = useState(1);

  // 10-Step Form States
  const [name, setName] = useState(businessProfile?.name || 'Apex Comfort HVAC');
  const [industry, setIndustry] = useState<IndustryType>(businessProfile?.industry || 'HVAC');
  const [phone, setPhone] = useState(businessProfile?.phone || '+1 (555) 382-9912');
  const [email, setEmail] = useState(businessProfile?.email || 'service@apexcomfort.com');
  const [website, setWebsite] = useState(businessProfile?.website || 'https://apexcomfort.com');
  const [serviceAreas, setServiceAreas] = useState<string[]>(
    businessProfile?.serviceAreas || ['Austin, TX', 'Round Rock', 'Cedar Park', 'Pflugerville', '78701', '78704']
  );
  const [newAreaInput, setNewAreaInput] = useState('');
  
  const [services, setServices] = useState<string[]>(
    businessProfile?.services || ['AC Repair & Diagnostics', 'Heating Installation', 'Duct Cleaning', 'Seasonal Maintenance', 'Emergency Dispatch']
  );
  const [newServiceInput, setNewServiceInput] = useState('');

  const [businessHours, setBusinessHours] = useState<BusinessHours>(
    businessProfile?.businessHours || DEFAULT_HOURS
  );
  const [timezone, setTimezone] = useState(businessProfile?.timezone || 'America/Chicago');
  const [about, setAbout] = useState(
    businessProfile?.about || 'Licensed, insured HVAC professionals delivering residential & commercial climate solutions.'
  );

  const handleAddArea = () => {
    if (!newAreaInput.trim()) return;
    if (!serviceAreas.includes(newAreaInput.trim())) {
      setServiceAreas([...serviceAreas, newAreaInput.trim()]);
    }
    setNewAreaInput('');
  };

  const handleRemoveArea = (item: string) => {
    setServiceAreas(serviceAreas.filter(a => a !== item));
  };

  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    if (!services.includes(newServiceInput.trim())) {
      setServices([...services, newServiceInput.trim()]);
    }
    setNewServiceInput('');
  };

  const handleRemoveService = (item: string) => {
    setServices(services.filter(s => s !== item));
  };

  const handleNext = () => {
    if (step < 10) {
      setStep(step + 1);
    } else {
      // Step 10: Complete Onboarding
      completeOnboarding({
        name,
        industry,
        phone,
        email,
        website,
        serviceAreas,
        services,
        businessHours,
        timezone,
        about,
      });

      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 bg-surface/95 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-2xs">
            <span className="material-symbols-outlined text-[20px] fill-icon">payments</span>
          </div>
          <div>
            <span className="font-extrabold text-base text-primary tracking-tight">Ventrexs</span>
            <span className="text-[10px] font-semibold text-outline tracking-wider uppercase ml-1.5">Setup Wizard</span>
          </div>
        </div>

        <div className="text-xs font-bold text-on-surface-variant">
          Step {step} of 10
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 sm:px-6 py-8 max-w-xl mx-auto w-full">
        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Step {step}: {
                step === 1 ? 'Business Name' :
                step === 2 ? 'Industry' :
                step === 3 ? 'Business Phone' :
                step === 4 ? 'Business Email' :
                step === 5 ? 'Website' :
                step === 6 ? 'Service Area' :
                step === 7 ? 'Services Offered' :
                step === 8 ? 'Business Hours' :
                step === 9 ? 'Timezone' : 'Review & Launch'
              }
            </span>
            <span className="text-xs font-semibold text-on-surface-variant">
              {Math.round((step / 10) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-surface-container-high rounded-full w-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(step / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Body */}
        <div className="flex-1 flex flex-col justify-between">
          {/* STEP 1: Business Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight mb-2">
                  What is your business name?
                </h1>
                <p className="text-sm text-on-surface-variant">
                  This will appear on your customer quotes, invoices, payment portal, and client communications.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">
                  Business / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Comfort HVAC & Heating"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 text-base text-on-surface font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Industry */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight mb-2">
                  Select your primary trade
                </h1>
                <p className="text-sm text-on-surface-variant">
                  We customize your pipeline workflows, appointment booking, and invoice line-items for your trade.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {INDUSTRY_OPTIONS.map((ind) => (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => setIndustry(ind.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      industry === ind.id
                        ? 'bg-primary-fixed/20 border-primary text-primary font-bold shadow-xs'
                        : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] shrink-0 text-primary">
                      {ind.icon}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold truncate">{ind.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Business Phone */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight mb-2">
                  What is your main dispatch phone?
                </h1>
                <p className="text-sm text-on-surface-variant">
                  The primary phone number for receiving client calls, dispatching technicians, and SMS reminders.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">
                  Main Business / Dispatch Phone *
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-11 pr-4 py-3.5 text-base text-on-surface font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Business Email */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight mb-2">
                  What is your billing & support email?
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Invoices, payment receipts, and customer questions will be delivered to this inbox.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">
                  Business Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="office@yourcompany.com"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-11 pr-4 py-3.5 text-base text-on-surface font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Website */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight mb-2">
                  What is your company website?
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Optional: If you have a website, we link it to your customer portal and automated estimates.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="w-5 h-5 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.yourcompany.com"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-11 pr-4 py-3.5 text-base text-on-surface font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Service Area */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight mb-2">
                  Where do you provide services?
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Add the cities, counties, or zip codes in your primary dispatch service radius.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAreaInput}
                    onChange={(e) => setNewAreaInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArea())}
                    placeholder="e.g. Austin, TX or 78701"
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddArea}
                    className="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-on-primary-fixed-variant transition-colors"
                  >
                    + Add Area
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/60 text-xs font-bold text-on-surface"
                    >
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{area}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArea(area)}
                        className="hover:text-error ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Services Offered */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight mb-2">
                  What services do you offer?
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Add the standard job types you quote and perform for homeowners and commercial clients.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newServiceInput}
                    onChange={(e) => setNewServiceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                    placeholder="e.g. AC Installation, Emergency Repair..."
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-on-primary-fixed-variant transition-colors"
                  >
                    + Add Service
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {services.map((srv) => (
                    <span
                      key={srv}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-fixed/20 border border-primary/30 text-xs font-bold text-primary"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{srv}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(srv)}
                        className="hover:text-error ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Business Hours */}
          {step === 8 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight mb-2">
                  What are your operating hours?
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Set standard hours when technicians can be booked for field visits.
                </p>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                  const item = businessHours[day] || { open: '08:00', close: '17:00', closed: false };
                  return (
                    <div key={day} className="p-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest flex items-center justify-between gap-3">
                      <span className="w-24 text-xs font-bold text-on-surface uppercase tracking-wider">
                        {day}
                      </span>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-on-surface-variant cursor-pointer mr-2">
                          <input
                            type="checkbox"
                            checked={item.closed}
                            onChange={(e) => {
                              setBusinessHours({
                                ...businessHours,
                                [day]: { ...item, closed: e.target.checked }
                              });
                            }}
                            className="rounded text-primary"
                          />
                          <span>Closed</span>
                        </label>

                        {!item.closed && (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="time"
                              value={item.open}
                              onChange={(e) => {
                                setBusinessHours({
                                  ...businessHours,
                                  [day]: { ...item, open: e.target.value }
                                });
                              }}
                              className="bg-surface border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface"
                            />
                            <span className="text-xs text-outline">to</span>
                            <input
                              type="time"
                              value={item.close}
                              onChange={(e) => {
                                setBusinessHours({
                                  ...businessHours,
                                  [day]: { ...item, close: e.target.value }
                                });
                              }}
                              className="bg-surface border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 9: Timezone & About */}
          {step === 9 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight mb-2">
                  Operating Timezone & Bio
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Ensure accurate scheduling for customer appointments and automated payment receipts.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-2">
                    Primary Business Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="America/New_York">Eastern Time (ET - America/New_York)</option>
                    <option value="America/Chicago">Central Time (CT - America/Chicago)</option>
                    <option value="America/Denver">Mountain Time (MT - America/Denver)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT - America/Los_Angeles)</option>
                    <option value="America/Phoenix">Arizona (MST - America/Phoenix)</option>
                    <option value="America/Anchorage">Alaska Time (AKT - America/Anchorage)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HST - Pacific/Honolulu)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-2">
                    About / Mission Statement
                  </label>
                  <textarea
                    rows={3}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Short description of your trade license, insured status, and service excellence..."
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: Review & Complete Setup */}
          {step === 10 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-tertiary-container/20 text-tertiary mb-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Ready for Deployment</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight mb-2">
                  Review & Launch Your Operating System
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Here is a summary of your configured Ventrexs Service OS environment:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-outline-variant/60">
                  <span className="text-outline">Business Name:</span>
                  <span className="font-bold text-on-surface">{name}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-outline-variant/60">
                  <span className="text-outline">Trade Industry:</span>
                  <span className="font-bold text-primary">{industry}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-outline-variant/60">
                  <span className="text-outline">Phone:</span>
                  <span className="font-semibold text-on-surface">{phone}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-outline-variant/60">
                  <span className="text-outline">Email:</span>
                  <span className="font-semibold text-on-surface">{email}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-outline-variant/60">
                  <span className="text-outline">Service Areas:</span>
                  <span className="font-semibold text-on-surface">{serviceAreas.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-outline-variant/60">
                  <span className="text-outline">Services Configured:</span>
                  <span className="font-semibold text-on-surface">{services.length} services</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-outline">Timezone:</span>
                  <span className="font-semibold text-on-surface">{timezone}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-outline-variant flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 rounded-xl border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-primary text-on-primary font-bold text-sm py-3 px-6 rounded-xl hover:bg-on-primary-fixed-variant transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>{step === 10 ? 'Launch Operating System' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
