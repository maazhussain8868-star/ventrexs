'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import {
  Palette,
  Eye,
  Save,
  Globe,
  Sparkles,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Check,
  RotateCcw,
  Smartphone,
  Monitor,
} from 'lucide-react';

export const AgencyWhiteLabel: React.FC = () => {
  const { showToast } = useApp();

  const [branding, setBranding] = useState({
    agencyName: 'Apex Growth Marketing',
    brandName: 'Apex Trade OS',
    logoText: 'Apex Trade OS',
    logoUrl: '/favicon.ico',
    primaryColor: '#0284c7',
    secondaryColor: '#0a0f1d',
    accentColor: '#10b981',
    loginHeadline: 'Client Operations Portal',
    loginTagline: 'Professional AI-powered service business operations and field management.',
    senderName: 'Apex Trade OS Cloud Notifications',
    supportEmail: 'help@apextradeos.com',
    supportPhone: '+1 (555) 901-2800',
    footerText: 'Powered by Apex Growth Cloud Infrastructure • All Rights Reserved',
    customPrivacyUrl: 'https://apextradeos.com/privacy',
    customTermsUrl: 'https://apextradeos.com/terms',
    showVentrexAttribution: false,
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);

  const presetThemes = [
    { name: 'Apex Cobalt (Default)', primary: '#0284c7', secondary: '#0a0f1d', accent: '#10b981' },
    { name: 'Emerald Pro', primary: '#059669', secondary: '#061a14', accent: '#3b82f6' },
    { name: 'Royal Violet', primary: '#7c3aed', secondary: '#0f0a1c', accent: '#ec4899' },
    { name: 'Industrial Amber', primary: '#d97706', secondary: '#161005', accent: '#0284c7' },
    { name: 'Midnight Obsidian', primary: '#2563eb', secondary: '#05070d', accent: '#06b6d4' },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast({
        title: 'White-Label Branding Published',
        description: 'New theme tokens, login portal styling, and email headers propagated to edge CDN.',
        type: 'info',
      });
    }, 600);
  };

  const handleApplyPreset = (p: typeof presetThemes[0]) => {
    setBranding({
      ...branding,
      primaryColor: p.primary,
      secondaryColor: p.secondary,
      accentColor: p.accent,
    });
    showToast({ title: 'Theme Preset Applied', description: p.name, type: 'info' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              White-Label Branding Suite
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono">
              Reseller Edition
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deliver a 100% custom-branded client experience under your agency's domain, colors, logos, and email signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={saving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
            className="text-xs font-bold bg-primary text-white shadow-sm"
          >
            Publish Branding
          </Button>
        </div>
      </div>

      {/* Preset Color Palettes */}
      <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Curated Reseller Theme Palettes
          </span>
          <span className="text-slate-400 text-[11px]">Click a palette to apply instantly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {presetThemes.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset)}
              className="p-2.5 rounded-xl bg-[#070b14] border border-outline-variant/40 hover:border-primary/50 transition-all text-left flex items-center gap-2.5 group"
            >
              <div className="flex items-center -space-x-1 shrink-0">
                <div className="w-4 h-4 rounded-full border border-black/50" style={{ backgroundColor: preset.primary }} />
                <div className="w-4 h-4 rounded-full border border-black/50" style={{ backgroundColor: preset.accent }} />
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white truncate">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Config & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Theme & Text Tokens */}
        <div className="lg:col-span-6 space-y-5">
          {/* Brand Identity & Theme Colors */}
          <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Visual Identity & Theme Tokens
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Brand Name</label>
                <input
                  type="text"
                  value={branding.brandName}
                  onChange={(e) => setBranding({ ...branding, brandName: e.target.value })}
                  className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Canvas / Dark BG</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Accent / Success</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Login Screen Copy */}
          <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Client Login Experience
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Login Screen Headline</label>
                <input
                  type="text"
                  value={branding.loginHeadline}
                  onChange={(e) => setBranding({ ...branding, loginHeadline: e.target.value })}
                  className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Login Screen Subtitle / Tagline</label>
                <input
                  type="text"
                  value={branding.loginTagline}
                  onChange={(e) => setBranding({ ...branding, loginTagline: e.target.value })}
                  className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Email & Support Footer */}
          <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Email Branding & Legal Signatures
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email Sender Name</label>
                  <input
                    type="text"
                    value={branding.senderName}
                    onChange={(e) => setBranding({ ...branding, senderName: e.target.value })}
                    className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={branding.supportEmail}
                    onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                    className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Portal Legal Footer Note</label>
                <input
                  type="text"
                  value={branding.footerText}
                  onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                  className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Interactive Preview Mockup */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Client Login Preview
              </h3>
            </div>

            <div className="flex items-center gap-1 bg-[#0a0f1d] border border-outline-variant/60 rounded-xl p-1">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg transition-colors ${
                  previewDevice === 'desktop' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg transition-colors ${
                  previewDevice === 'mobile' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Simulated Device Mockup */}
          <div
            className={`border border-outline-variant/60 rounded-3xl overflow-hidden shadow-2xl transition-all ${
              previewDevice === 'mobile' ? 'max-w-xs mx-auto' : 'w-full'
            }`}
            style={{ backgroundColor: branding.secondaryColor }}
          >
            {/* Browser top pill */}
            <div className="px-4 py-2.5 bg-[#070b14] border-b border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="truncate px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                https://portal.youragency.com/login
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            {/* Login Card inside simulated page */}
            <div className="p-8 sm:p-12 space-y-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="text-center space-y-2 max-w-sm">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl mx-auto shadow-lg"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  {branding.brandName.charAt(0)}
                </div>
                <h4 className="text-lg font-black text-white">{branding.brandName}</h4>
                <p className="text-xs text-slate-300 font-semibold">{branding.loginHeadline}</p>
                <p className="text-[11px] text-slate-400">{branding.loginTagline}</p>
              </div>

              <div className="w-full max-w-xs space-y-3">
                <div className="h-9 bg-white/5 border border-white/10 rounded-xl px-3 flex items-center text-xs text-slate-400 font-mono">
                  owner@apexcomfort.com
                </div>
                <div className="h-9 bg-white/5 border border-white/10 rounded-xl px-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>••••••••••••</span>
                </div>
                <button
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Sign In to Workspace
                </button>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-white/10 max-w-xs">
                {branding.footerText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
