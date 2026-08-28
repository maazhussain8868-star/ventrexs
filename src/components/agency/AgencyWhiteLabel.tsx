'use client';

import React, { useState } from 'react';
import { AgencyClient } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import {
  Palette,
  Laptop,
  Smartphone,
  Upload,
  CheckCircle2,
  Sparkles,
  Save,
  Globe,
  Sliders,
  Building2,
  Eye,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface AgencyWhiteLabelProps {
  clients: AgencyClient[];
  onSaveBranding?: (branding: any) => void;
}

export const AgencyWhiteLabel: React.FC<AgencyWhiteLabelProps> = ({
  clients,
  onSaveBranding,
}) => {
  const { showToast } = useApp();
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || 'client_01');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const [brandName, setBrandName] = useState(selectedClient?.name || 'Apex Comfort HVAC');
  const [primaryColor, setPrimaryColor] = useState(selectedClient?.accentColor || '#4f46e5');
  const [secondaryColor, setSecondaryColor] = useState('#0f172a');
  const [headline, setHeadline] = useState('Client Portal & Dispatch Management');
  const [description, setDescription] = useState('Secure contractor operations and real-time scheduling.');
  const [emailSignature, setEmailSignature] = useState('Powered by Ventrexs AI');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast({
        title: 'Branding Saved',
        description: `White-label brand assets published for ${brandName}.`,
        type: 'success',
      });
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
            White-Label Brand Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
            Customize logo, color palettes, customer login headlines, and email signatures for each client tenant.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 shrink-0">
          <select
            value={selectedClientId}
            onChange={(e) => {
              setSelectedClientId(e.target.value);
              const c = clients.find((x) => x.id === e.target.value);
              if (c) {
                setBrandName(c.name);
                setPrimaryColor(c.accentColor || '#4f46e5');
              }
            }}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 shadow-2xs min-h-[36px] max-w-[200px] sm:max-w-xs truncate"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={saving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
            className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-xs min-h-[36px]"
          >
            Publish Branding
          </Button>
        </div>
      </div>

      {/* Main 2-Column Brand Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-w-0">
        {/* Left Column: Brand Settings Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5 min-w-0">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Palette className="w-4 h-4 text-violet-600 shrink-0" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Brand Configuration</h2>
          </div>

          <div className="space-y-3 sm:space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Company Display Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[36px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 min-h-[36px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Secondary Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 min-h-[36px]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Portal Login Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[36px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Portal Subtitle / Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Email Notification Signature</label>
              <input
                type="text"
                value={emailSignature}
                onChange={(e) => setEmailSignature(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[36px]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Device Mockup (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 flex flex-col min-w-0">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Eye className="w-4 h-4 text-violet-600 shrink-0" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider truncate">
                Customer Portal Preview
              </h2>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all min-h-[32px] ${
                  previewDevice === 'desktop'
                    ? 'bg-white text-violet-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all min-h-[32px] ${
                  previewDevice === 'mobile'
                    ? 'bg-white text-violet-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-100/70 rounded-2xl border border-slate-200 min-w-0 overflow-hidden">
            {previewDevice === 'desktop' ? (
              <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-300 shadow-lg overflow-hidden transition-all">
                {/* Mock Browser Header */}
                <div className="bg-slate-200/70 px-3 sm:px-4 py-2 flex items-center gap-2 border-b border-slate-300">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 text-center font-mono text-[9px] sm:text-[10px] text-slate-600 bg-white py-0.5 rounded border border-slate-300 truncate">
                    https://{selectedClient?.domain || 'portal.apexcomfort.com'}
                  </div>
                </div>

                {/* Mock Client Portal UI */}
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {brandName.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">{brandName}</span>
                    </div>
                    <button
                      className="px-2.5 sm:px-3 py-1 rounded-lg text-white font-bold text-xs shadow-2xs shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Book Service
                    </button>
                  </div>

                  <div className="py-4 sm:py-6 text-center space-y-1.5 sm:space-y-2">
                    <h3 className="text-base sm:text-xl font-extrabold text-slate-900">{headline}</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto line-clamp-2">{description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2">
                    <div className="p-2 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                      <span className="text-xs font-bold text-emerald-600">Active</span>
                    </div>
                    <div className="p-2 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block">SLA</span>
                      <span className="text-xs font-bold text-slate-900 font-mono">99.9%</span>
                    </div>
                    <div className="p-2 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block">AI Triage</span>
                      <span className="text-xs font-bold" style={{ color: primaryColor }}>Online</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Mobile Preview */
              <div className="w-56 sm:w-64 bg-white rounded-3xl border-4 border-slate-800 shadow-xl overflow-hidden p-3.5 sm:p-4 space-y-3">
                <div className="w-12 sm:w-16 h-1 bg-slate-300 rounded-full mx-auto mb-2" />
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {brandName.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-xs text-slate-900 truncate">{brandName}</span>
                </div>
                <div className="py-2 text-center space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">{headline}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{description}</p>
                </div>
                <button
                  className="w-full py-1.5 rounded-lg text-white font-bold text-[11px]"
                  style={{ backgroundColor: primaryColor }}
                >
                  Request Dispatch
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
