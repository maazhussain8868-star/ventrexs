'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { getAgencyBrandingAction, updateAgencyBrandingAction } from '@/app/actions/agency';
import { WhiteLabelBranding } from '@/lib/agency/types';
import {
  Palette,
  Eye,
  Check,
  Building,
  Sparkles,
  Save,
  Globe,
  Mail,
  Phone,
} from 'lucide-react';

export default function AgencyBrandingPage() {
  const { showToast } = useApp();
  const [branding, setBranding] = useState<WhiteLabelBranding>({
    brandName: 'Apex Trade OS',
    logoUrl: '/favicon.ico',
    primaryColor: '#0284c7',
    secondaryColor: '#0f172a',
    accentColor: '#059669',
    loginHeadline: 'Client Portal Login',
    loginTagline: 'Professional service management powered by modern AI.',
    supportEmail: 'help@apextradeos.com',
    supportPhone: '+1 (555) 901-2800',
    footerText: 'Powered by Apex Trade Cloud',
    customPrivacyUrl: 'https://apextradeos.com/privacy',
    customTermsUrl: 'https://apextradeos.com/terms',
    isActive: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadBranding() {
      const res = await getAgencyBrandingAction();
      if (res.success && res.data) {
        setBranding(res.data);
      }
    }
    loadBranding();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateAgencyBrandingAction(branding);
    setSaving(false);
    if (res.success) {
      showToast({ title: 'Branding Saved', description: 'White-label themes and tokens applied.', type: 'info' });
    }
  };

  return (
    <AppShell
      title="White-Label Branding Suite"
      showBack
      backUrl="/agency"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          isLoading={saving}
          leftIcon={<Save className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Save Branding
        </Button>
      }
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Configuration */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-on-surface">Brand Identity & Colors</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface mb-1">Agency Brand Name</label>
                <input
                  type="text"
                  value={branding.brandName}
                  onChange={(e) => setBranding({ ...branding, brandName: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-2.5 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-1.5 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-1.5 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-1.5 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Login Headline</label>
                <input
                  type="text"
                  value={branding.loginHeadline}
                  onChange={(e) => setBranding({ ...branding, loginHeadline: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-2.5 text-on-surface"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Login Tagline</label>
                <input
                  type="text"
                  value={branding.loginTagline}
                  onChange={(e) => setBranding({ ...branding, loginTagline: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-2.5 text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Support Email</label>
                  <input
                    type="email"
                    value={branding.supportEmail}
                    onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-2.5 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={branding.supportPhone}
                    onChange={(e) => setBranding({ ...branding, supportPhone: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-2.5 text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Footer Text</label>
                <input
                  type="text"
                  value={branding.footerText}
                  onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-2.5 text-on-surface"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Preview: Live White-Label Rendering */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Live Preview</h3>
          </div>

          {/* Simulated Login Screen */}
          <div className="border border-outline-variant rounded-2xl overflow-hidden shadow-lg bg-surface-container-lowest">
            <div className="p-6 text-center space-y-4" style={{ backgroundColor: branding.secondaryColor }}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-white font-bold text-xl">
                {branding.brandName.charAt(0)}
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">{branding.brandName}</h4>
                <p className="text-xs text-white/70">{branding.loginHeadline}</p>
              </div>
            </div>

            <div className="p-6 space-y-4 bg-surface-container-lowest">
              <div className="space-y-3">
                <div className="h-8 bg-surface-container-high rounded-lg" />
                <div className="h-8 bg-surface-container-high rounded-lg" />
                <button
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-sm"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Sign In to Workspace
                </button>
              </div>

              <div className="pt-4 border-t border-outline-variant/60 text-center text-[10px] text-on-surface-variant">
                {branding.footerText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
