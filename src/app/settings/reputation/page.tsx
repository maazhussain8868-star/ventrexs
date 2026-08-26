'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { 
  Star, 
  Settings, 
  Clock, 
  Send, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Save, 
  ExternalLink, 
  ShieldCheck,
  RotateCw,
  Sparkles,
  Info
} from 'lucide-react';

export default function ReputationSettingsPage() {
  const { reviewSettings, updateReviewSettings, showToast } = useApp();

  const [automationEnabled, setAutomationEnabled] = useState(reviewSettings.automationEnabled ?? true);
  const [requestDelayHours, setRequestDelayHours] = useState(reviewSettings.requestDelayHours ?? 24);
  const [primaryPlatform, setPrimaryPlatform] = useState(reviewSettings.primaryPlatform || 'google');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(reviewSettings.googleReviewUrl || '');
  const [defaultChannel, setDefaultChannel] = useState<'sms' | 'email' | 'whatsapp'>(reviewSettings.defaultChannel || 'sms');
  const [positiveThreshold, setPositiveThreshold] = useState(reviewSettings.positiveThreshold || 4);
  const [maxRequestsPerJob, setMaxRequestsPerJob] = useState(reviewSettings.maxRequestsPerJob || 2);

  const [smsBodyTemplate, setSmsBodyTemplate] = useState(
    reviewSettings.smsBodyTemplate || 'Hi {{customer_name}}, thanks for choosing {{business_name}}! How was your service with {{technician_name}}? Share feedback: {{feedback_url}}'
  );
  const [emailSubjectTemplate, setEmailSubjectTemplate] = useState(
    reviewSettings.emailSubjectTemplate || 'How was your recent service with {{business_name}}?'
  );
  const [emailBodyTemplate, setEmailBodyTemplate] = useState(
    reviewSettings.emailBodyTemplate || 'Hi {{customer_name}}, thank you for choosing {{business_name}} for your recent service call with {{technician_name}}. Please take a moment to share your experience with us: {{feedback_url}}'
  );
  const [whatsappBodyTemplate, setWhatsappBodyTemplate] = useState(
    reviewSettings.whatsappBodyTemplate || 'Hello {{customer_name}}, thank you for trusting {{business_name}}. We would love to know how {{technician_name}} did today: {{feedback_url}}'
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateReviewSettings({
        automationEnabled,
        requestDelayHours: Number(requestDelayHours),
        primaryPlatform: primaryPlatform as any,
        googleReviewUrl,
        defaultChannel,
        positiveThreshold: Number(positiveThreshold),
        maxRequestsPerJob: Number(maxRequestsPerJob),
        smsBodyTemplate,
        emailSubjectTemplate,
        emailBodyTemplate,
        whatsappBodyTemplate,
      });
    } catch (err: any) {
      showToast({ title: 'Failed to update settings', description: err.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell
      title="Reputation Settings"
      showBack
      backUrl="/reputation"
    >
      <form onSubmit={handleSaveSettings} className="max-w-4xl space-y-6">
        {/* Automation Master Toggle */}
        <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Automatic Review Requests on Job Completion
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                When a technician marks a work order as <strong className="text-on-surface">COMPLETED</strong>, automatically schedule an ethical review request survey.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={automationEnabled}
                onChange={(e) => setAutomationEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {automationEnabled && (
            <div className="mt-5 pt-5 border-t border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Grace Delay Before Dispatch
                </label>
                <select
                  value={requestDelayHours}
                  onChange={(e) => setRequestDelayHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold"
                >
                  <option value={0}>Immediate (0 hours)</option>
                  <option value={1}>1 hour after completion</option>
                  <option value={6}>6 hours after completion</option>
                  <option value={24}>24 hours after completion (Recommended)</option>
                  <option value={48}>48 hours after completion</option>
                  <option value={72}>72 hours after completion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Default Communication Channel
                </label>
                <select
                  value={defaultChannel}
                  onChange={(e) => setDefaultChannel(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold"
                >
                  <option value="sms">SMS Direct (Highest response rate)</option>
                  <option value="email">Email Invitation</option>
                  <option value="whatsapp">WhatsApp Message</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Public Review Platforms & Thresholds */}
        <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Public Review Platform & Routing
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Primary Review Platform
              </label>
              <select
                value={primaryPlatform}
                onChange={(e) => setPrimaryPlatform(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold"
              >
                <option value="google">Google Business Profile (Google Reviews)</option>
                <option value="yelp">Yelp</option>
                <option value="facebook">Facebook Recommendations</option>
                <option value="direct">Direct Internal Portal Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Positive Rating Threshold
              </label>
              <select
                value={positiveThreshold}
                onChange={(e) => setPositiveThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold"
              >
                <option value={4}>4 Stars & Above (Direct to Google Review)</option>
                <option value={5}>5 Stars Only (Direct to Google Review)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1.5">
              Google Review URL / Direct Link
            </label>
            <input
              type="url"
              placeholder="e.g. https://g.page/r/YOUR_BUSINESS_ID/review"
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
            />
            <p className="text-[11px] text-on-surface-variant mt-1">
              Customers rating service {positiveThreshold}★ or higher will be presented with a direct button to this review link.
            </p>
          </div>
        </div>

        {/* Message Templates */}
        <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Survey Message Templates
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Customize outgoing review request messages. Supported placeholders: <code className="bg-surface-variant px-1 rounded">{'{{customer_name}}'}</code>, <code className="bg-surface-variant px-1 rounded">{'{{business_name}}'}</code>, <code className="bg-surface-variant px-1 rounded">{'{{technician_name}}'}</code>, <code className="bg-surface-variant px-1 rounded">{'{{feedback_url}}'}</code>.
              </p>
            </div>
          </div>

          {/* SMS Template */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-teal-600" />
              SMS Message Template
            </label>
            <textarea
              rows={3}
              value={smsBodyTemplate}
              onChange={(e) => setSmsBodyTemplate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface leading-relaxed"
            />
          </div>

          {/* Email Template */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-primary" />
              Email Subject & Body Template
            </label>
            <input
              type="text"
              placeholder="Email subject..."
              value={emailSubjectTemplate}
              onChange={(e) => setEmailSubjectTemplate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold mb-2"
            />
            <textarea
              rows={4}
              value={emailBodyTemplate}
              onChange={(e) => setEmailBodyTemplate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface leading-relaxed"
            />
          </div>

          {/* WhatsApp Template */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              WhatsApp Template
            </label>
            <textarea
              rows={3}
              value={whatsappBodyTemplate}
              onChange={(e) => setWhatsappBodyTemplate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface leading-relaxed"
            />
          </div>
        </div>

        {/* Ethical Review Safeguard Notice */}
        <div className="p-4 rounded-xl bg-surface-variant/40 border border-outline-variant/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-on-surface-variant space-y-1">
            <strong className="text-on-surface block">Ethical Feedback Policy:</strong>
            <p>
              Ventrexs AI follows strict ethical guidelines. We do not manipulate, suppress, or incentivize reviews. All customers are free to share feedback on their experience.
            </p>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/reputation"
            className="px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-variant rounded-xl border border-outline-variant transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={isSaving}
            className="gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
