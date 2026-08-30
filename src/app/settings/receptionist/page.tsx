'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/context/AppContext';
import { ReceptionistService, ReceptionistTone, ReceptionistFAQ } from '@/types';
import {
  Sliders,
  Plus,
  Trash2,
  Edit3,
  Bot,
  Save,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  MessageSquare
} from 'lucide-react';

function ReceptionistSettingsContent() {
  const router = useRouter();
  const {
    receptionistSettings,
    receptionistServices,
    updateReceptionistSettings,
    saveReceptionistService,
    deleteReceptionistService,
  } = useApp();

  // Form states for general settings
  const [greeting, setGreeting] = useState(receptionistSettings?.greeting || '');
  const [businessDescription, setBusinessDescription] = useState(receptionistSettings?.businessDescription || '');
  const [tone, setTone] = useState<ReceptionistTone>(receptionistSettings?.tone || 'professional');
  const [afterHoursMessage, setAfterHoursMessage] = useState(receptionistSettings?.afterHoursMessage || '');
  const [emergencyInstructions, setEmergencyInstructions] = useState(receptionistSettings?.emergencyInstructions || '');
  const [bookingEnabled, setBookingEnabled] = useState(receptionistSettings?.bookingEnabled ?? true);
  const [bookingLeadTimeHours, setBookingLeadTimeHours] = useState(receptionistSettings?.bookingLeadTimeHours || 2);
  const [bookingMaxDaysAhead, setBookingMaxDaysAhead] = useState(receptionistSettings?.bookingMaxDaysAhead || 14);
  const [handoffKeywordsInput, setHandoffKeywordsInput] = useState(receptionistSettings?.humanHandoffKeywords?.join(', ') || '');
  const [faqs, setFaqs] = useState<ReceptionistFAQ[]>(receptionistSettings?.faqs || []);

  useEffect(() => {
    if (receptionistSettings) {
      setGreeting(receptionistSettings.greeting || '');
      setBusinessDescription(receptionistSettings.businessDescription || '');
      setTone(receptionistSettings.tone || 'professional');
      setAfterHoursMessage(receptionistSettings.afterHoursMessage || '');
      setEmergencyInstructions(receptionistSettings.emergencyInstructions || '');
      setBookingEnabled(receptionistSettings.bookingEnabled ?? true);
      setBookingLeadTimeHours(receptionistSettings.bookingLeadTimeHours || 2);
      setBookingMaxDaysAhead(receptionistSettings.bookingMaxDaysAhead || 14);
      setHandoffKeywordsInput(receptionistSettings.humanHandoffKeywords?.join(', ') || '');
      setFaqs(receptionistSettings.faqs || []);
    }
  }, [receptionistSettings]);

  // Service modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Cooling');
  const [serviceDescription, setServiceDescription] = useState('');
  const [typicalDuration, setTypicalDuration] = useState(60);
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);
  const [basePrice, setBasePrice] = useState(89);
  const [qualificationQuestions, setQualificationQuestions] = useState('');

  // FAQ Modal state
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // Handle save all settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = handoffKeywordsInput
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    await updateReceptionistSettings({
      greeting,
      businessDescription,
      tone,
      afterHoursMessage,
      emergencyInstructions,
      bookingEnabled,
      bookingLeadTimeHours: Number(bookingLeadTimeHours) || 2,
      bookingMaxDaysAhead: Number(bookingMaxDaysAhead) || 14,
      humanHandoffKeywords: keywords,
      faqs,
    });
  };

  // Open add service modal
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceName('');
    setServiceCategory('General');
    setServiceDescription('');
    setTypicalDuration(60);
    setEmergencyAvailable(false);
    setBasePrice(0);
    setQualificationQuestions('');
    setIsServiceModalOpen(true);
  };

  // Open edit service modal
  const handleOpenEditService = (svc: ReceptionistService) => {
    setEditingServiceId(svc.id);
    setServiceName(svc.name);
    setServiceCategory(svc.category);
    setServiceDescription(svc.description);
    setTypicalDuration(svc.typicalDurationMinutes);
    setEmergencyAvailable(svc.emergencyAvailable);
    setBasePrice(svc.basePrice || 0);
    setQualificationQuestions((svc.qualificationQuestions || []).join('\n'));
    setIsServiceModalOpen(true);
  };

  // Submit save service
  const handleSaveServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    const questions = qualificationQuestions
      .split('\n')
      .map(q => q.trim())
      .filter(Boolean);

    await saveReceptionistService({
      id: editingServiceId || undefined,
      name: serviceName,
      category: serviceCategory,
      description: serviceDescription,
      typicalDurationMinutes: Number(typicalDuration) || 60,
      emergencyAvailable,
      bookingEligible: true,
      basePrice: Number(basePrice) || 0,
      qualificationQuestions: questions,
    });

    setIsServiceModalOpen(false);
  };

  // Add FAQ pair
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;

    setFaqs(prev => [...prev, { question: faqQuestion.trim(), answer: faqAnswer.trim() }]);
    setFaqQuestion('');
    setFaqAnswer('');
    setIsFaqModalOpen(false);
  };

  // Delete FAQ
  const handleDeleteFaq = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        <PageHeader
          title="Receptionist Configuration & Knowledge"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'AI Receptionist', href: '/receptionist' },
            { label: 'Settings' }
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/receptionist/test">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Test Simulator</span>
                </Button>
              </Link>
              <Button onClick={handleSaveSettings} size="sm" className="gap-1.5 shadow-md shadow-primary/20">
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </Button>
            </div>
          }
        />

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section 1: Business Identity & Tone */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div>
                <h3 className="font-bold text-sm text-on-surface">Receptionist Persona & Tone</h3>
                <p className="text-xs text-outline">Configure greeting, tone of voice, and business introduction</p>
              </div>
              <Bot className="w-5 h-5 text-primary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Conversational Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as ReceptionistTone)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 text-xs font-semibold text-on-surface"
                >
                  <option value="professional">Professional & Direct</option>
                  <option value="friendly">Warm & Friendly</option>
                  <option value="emergency_first">Emergency & Urgent-First</option>
                  <option value="concise">Concise & Dispatch-Oriented</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Operating Hours Mode</label>
                <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant text-xs text-on-surface flex items-center justify-between">
                  <span>Standard 8:00 AM - 6:00 PM</span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Attendant</span>
                </div>
              </div>
            </div>

            <div>
              <Input
                label="Inbound Customer Greeting *"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder="Hi! Thanks for contacting us..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Business Overview & Scope</label>
              <textarea
                rows={2}
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="Explain what your business does and target coverage..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Section 2: Structured Service Knowledge Catalog */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div>
                <h3 className="font-bold text-sm text-on-surface">Service Knowledge Catalog</h3>
                <p className="text-xs text-outline">Teach the receptionist which services you perform, typical durations, and diagnostic rates</p>
              </div>
              <Button type="button" size="sm" onClick={handleOpenAddService} className="gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {receptionistServices.map((svc) => (
                <div key={svc.id} className="p-4 rounded-xl border border-outline-variant bg-surface-container/20 space-y-2 relative group">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-xs text-on-surface block">{svc.name}</span>
                      <span className="text-[10px] font-semibold text-primary uppercase">{svc.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditService(svc)}
                        className="p-1 hover:bg-surface-container rounded text-outline hover:text-on-surface"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteReceptionistService(svc.id)}
                        className="p-1 hover:bg-error/10 rounded text-error"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-2">{svc.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-outline pt-2 border-t border-outline-variant/30">
                    <span>Duration: {svc.typicalDurationMinutes} mins</span>
                    {svc.emergencyAvailable ? (
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <Flame className="w-3 h-3" /> 24/7 Available
                      </span>
                    ) : (
                      <span>Regular Hours</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Booking & Availability Rules */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div>
                <h3 className="font-bold text-sm text-on-surface">Appointment Scheduling Rules</h3>
                <p className="text-xs text-outline">Define automated booking constraints and buffer rules</p>
              </div>
              <Calendar className="w-5 h-5 text-primary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Direct Booking</label>
                <select
                  value={bookingEnabled ? 'enabled' : 'disabled'}
                  onChange={(e) => setBookingEnabled(e.target.value === 'enabled')}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 text-xs font-semibold text-on-surface"
                >
                  <option value="enabled">Enabled (Auto-Schedule)</option>
                  <option value="disabled">Disabled (Capture Inquiries Only)</option>
                </select>
              </div>

              <div>
                <Input
                  label="Minimum Lead Time (Hours)"
                  type="number"
                  value={bookingLeadTimeHours}
                  onChange={(e) => setBookingLeadTimeHours(Number(e.target.value))}
                  placeholder="2"
                />
              </div>

              <div>
                <Input
                  label="Max Days In Advance"
                  type="number"
                  value={bookingMaxDaysAhead}
                  onChange={(e) => setBookingMaxDaysAhead(Number(e.target.value))}
                  placeholder="14"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Emergency & Human Handoff Triggers */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div>
                <h3 className="font-bold text-sm text-on-surface">Emergency & Human Handoff Triggers</h3>
                <p className="text-xs text-outline">Keywords and emergency rules that instantly escalate to your team</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>

            <div>
              <Input
                label="Emergency Instructions & Escalation Notes"
                value={emergencyInstructions}
                onChange={(e) => setEmergencyInstructions(e.target.value)}
                placeholder="e.g. Flag gas leaks or severe water leaks immediately..."
              />
            </div>

            <div>
              <Input
                label="Human Handoff Keywords (comma-separated)"
                value={handoffKeywordsInput}
                onChange={(e) => setHandoffKeywordsInput(e.target.value)}
                placeholder="human, agent, person, manager, dispute, complaint"
              />
            </div>

            <div>
              <Input
                label="After-Hours Auto-Attendant Notice"
                value={afterHoursMessage}
                onChange={(e) => setAfterHoursMessage(e.target.value)}
                placeholder="We are currently outside regular business hours..."
              />
            </div>
          </div>

          {/* Section 5: FAQ Knowledge Base */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div>
                <h3 className="font-bold text-sm text-on-surface">FAQ Knowledge Base</h3>
                <p className="text-xs text-outline">Custom business answers the receptionist can reference</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => setIsFaqModalOpen(true)} className="gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </Button>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-outline-variant bg-surface-container/20 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-on-surface block">Q: {faq.question}</span>
                    <p className="text-xs text-on-surface-variant mt-0.5">A: {faq.answer}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(idx)}
                    className="p-1 hover:bg-error/10 rounded text-error shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="md" className="gap-1.5 shadow-md shadow-primary/20">
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </Button>
          </div>
        </form>

        {/* Modal: Add/Edit Service Knowledge */}
        <Modal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          title={editingServiceId ? 'Edit Service Knowledge' : 'Add Service Knowledge'}
          maxWidth="md"
        >
          <form onSubmit={handleSaveServiceSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Service Name *"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. AC Diagnostic & Repair"
                required
              />
              <Input
                label="Category"
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                placeholder="e.g. Cooling, Heating, Plumbing"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Duration (Minutes)"
                type="number"
                value={typicalDuration}
                onChange={(e) => setTypicalDuration(Number(e.target.value))}
                placeholder="60"
              />
              <Input
                label="Base Price ($)"
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                placeholder="89"
              />
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Emergency 24/7</label>
                <select
                  value={emergencyAvailable ? 'yes' : 'no'}
                  onChange={(e) => setEmergencyAvailable(e.target.value === 'yes')}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-xs text-on-surface"
                >
                  <option value="no">Standard Hours</option>
                  <option value="yes">24/7 Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Description & Scope</label>
              <textarea
                rows={2}
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Explain what is included in this service..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Qualification Questions (one per line)</label>
              <textarea
                rows={3}
                value={qualificationQuestions}
                onChange={(e) => setQualificationQuestions(e.target.value)}
                placeholder="Is the outdoor unit running?&#10;What is the approximate age of the system?"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
              <Button type="button" variant="ghost" onClick={() => setIsServiceModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Service</Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Add FAQ */}
        <Modal
          isOpen={isFaqModalOpen}
          onClose={() => setIsFaqModalOpen(false)}
          title="Add Business FAQ"
          maxWidth="sm"
        >
          <form onSubmit={handleAddFaq} className="space-y-4">
            <Input
              label="Question *"
              value={faqQuestion}
              onChange={(e) => setFaqQuestion(e.target.value)}
              placeholder="e.g. Do you offer warranties?"
              required
            />
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Answer *</label>
              <textarea
                rows={3}
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                placeholder="e.g. Yes, we provide a 10-year parts warranty..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
              <Button type="button" variant="ghost" onClick={() => setIsFaqModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add to Knowledge</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

export default function ReceptionistSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-outline">Loading Receptionist Settings...</div>}>
      <ReceptionistSettingsContent />
    </Suspense>
  );
}
