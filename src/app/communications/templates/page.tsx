'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { 
  FileText, 
  Plus, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  Edit3, 
  Trash2, 
  Eye, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import { CommChannel, CommCategory, CommunicationTemplate } from '@/types';
import { interpolateTemplate } from '@/lib/communications/template-engine';

export default function TemplatesPage() {
  const { communicationTemplates, saveCommunicationTemplate, deleteCommunicationTemplate, businessProfile } = useApp();
  const [selectedChannel, setSelectedChannel] = useState<'all' | CommChannel>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<CommunicationTemplate | null>(null);

  // Editor State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<CommChannel>('email');
  const [category, setCategory] = useState<CommCategory>('appointment_confirmation');
  const [subjectTemplate, setSubjectTemplate] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredTemplates = communicationTemplates.filter(t => {
    if (selectedChannel !== 'all' && t.channel !== selectedChannel) return false;
    return true;
  });

  const availableVariables = [
    { key: 'customer_name', label: 'Customer Name', sample: 'Michael Scott' },
    { key: 'business_name', label: 'Business Name', sample: businessProfile?.name || 'Main Street Bakery' },
    { key: 'service_name', label: 'Service Name', sample: 'Commercial HVAC Tune-Up' },
    { key: 'appointment_date', label: 'Appointment Date', sample: 'Aug 26, 2026' },
    { key: 'appointment_time', label: 'Appointment Time', sample: '10:00 AM' },
    { key: 'technician_name', label: 'Technician Name', sample: 'Marcus Vance' },
    { key: 'business_phone', label: 'Business Phone', sample: businessProfile?.phone || '+1 (555) 382-9912' },
    { key: 'invoice_number', label: 'Invoice Number', sample: 'INV-2041' },
    { key: 'invoice_amount', label: 'Invoice Amount', sample: '$480.00' },
    { key: 'due_date', label: 'Due Date', sample: 'Sep 10, 2026' },
  ];

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setChannel('email');
    setCategory('custom');
    setSubjectTemplate('');
    setBodyTemplate('');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (tmpl: CommunicationTemplate) => {
    setEditingId(tmpl.id);
    setName(tmpl.name);
    setChannel(tmpl.channel);
    setCategory(tmpl.category);
    setSubjectTemplate(tmpl.subjectTemplate || '');
    setBodyTemplate(tmpl.bodyTemplate);
    setIsEditorOpen(true);
  };

  const handleInsertToken = (tokenKey: string) => {
    setBodyTemplate(prev => `${prev} {{${tokenKey}}}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bodyTemplate) return;

    setIsSaving(true);
    await saveCommunicationTemplate({
      id: editingId || undefined,
      name,
      channel,
      category,
      subjectTemplate: channel === 'email' ? subjectTemplate : undefined,
      bodyTemplate,
      variables: availableVariables.map(v => v.key),
    });
    setIsSaving(false);
    setIsEditorOpen(false);
  };

  const getPreviewVariables = () => {
    const vars: Record<string, string> = {};
    availableVariables.forEach(v => {
      vars[v.key] = v.sample;
    });
    return vars;
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/communications" className="p-1 rounded-lg text-outline hover:bg-surface-container-high transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-black tracking-tight text-on-surface">
                Communication Templates
              </h1>
            </div>
            <p className="text-sm text-outline pl-8">
              Standardized, variable-interpolated messages for transactional notifications, reminders, and follow-ups.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>

        {/* Channel Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
          {[
            { id: 'all', label: 'All Channels' },
            { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4 text-blue-500" /> },
            { id: 'sms', label: 'SMS', icon: <MessageSquare className="w-4 h-4 text-emerald-500" /> },
            { id: 'whatsapp', label: 'WhatsApp', icon: <PhoneCall className="w-4 h-4 text-green-600" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedChannel(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                selectedChannel === tab.id
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(tmpl => (
            <div
              key={tmpl.id}
              className="p-5 rounded-3xl bg-surface border border-outline-variant hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-surface-container-high">
                      {tmpl.channel === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                      {tmpl.channel === 'sms' && <MessageSquare className="w-4 h-4 text-emerald-500" />}
                      {tmpl.channel === 'whatsapp' && <PhoneCall className="w-4 h-4 text-green-600" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-on-surface leading-snug">{tmpl.name}</h3>
                      <span className="text-[11px] text-outline capitalize">{tmpl.category.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {tmpl.isSystem ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                      System
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface shrink-0">
                      Custom
                    </span>
                  )}
                </div>

                {tmpl.subjectTemplate && (
                  <div className="p-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-[11px] text-on-surface font-semibold truncate">
                    Subj: {tmpl.subjectTemplate}
                  </div>
                )}

                <p className="text-xs text-on-surface-variant line-clamp-4 leading-relaxed font-mono bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant">
                  {tmpl.bodyTemplate}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
                <button
                  onClick={() => setPreviewTemplate(tmpl)}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-outline" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-1">
                  {!tmpl.isSystem && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(tmpl)}
                        className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                        title="Edit Template"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCommunicationTemplate(tmpl.id)}
                        className="p-1.5 rounded-lg text-outline hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-outline-variant shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="font-bold text-base text-on-surface">
                {editingId ? 'Edit Communication Template' : 'Create New Template'}
              </h3>
              <button onClick={() => setIsEditorOpen(false)} className="p-1 rounded-lg text-outline hover:bg-surface-container-high">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Template Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Appointment Confirmation"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={e => setChannel(e.target.value as CommChannel)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS Text</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>

              {channel === 'email' && (
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Subject Template
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Appointment Confirmed: {{service_name}}"
                    value={subjectTemplate}
                    onChange={e => setSubjectTemplate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
                  />
                </div>
              )}

              {/* Dynamic Variables Pill Bar */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Insert Variables
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableVariables.map(v => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => handleInsertToken(v.key)}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary/10 hover:text-primary text-[11px] font-semibold text-on-surface transition-colors"
                    >
                      + {`{{${v.key}}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Body Template
                </label>
                <textarea
                  rows={6}
                  placeholder="Template message content with {{variables}}..."
                  value={bodyTemplate}
                  onChange={e => setBodyTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface font-mono focus:outline-hidden focus:border-primary"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-outline-variant shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-on-surface">Live Variable Preview</h3>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="p-1 rounded-lg text-outline hover:bg-surface-container-high">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-outline mb-0.5">Template</p>
                <p className="text-sm font-bold text-on-surface">{previewTemplate.name}</p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{previewTemplate.channel}</span>
              </div>

              {previewTemplate.subjectTemplate && (
                <div>
                  <p className="text-xs text-outline mb-0.5">Rendered Subject</p>
                  <p className="text-xs font-bold text-on-surface">
                    {interpolateTemplate(previewTemplate.subjectTemplate, getPreviewVariables())}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-outline mb-1">Rendered Body Output</p>
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant text-xs text-on-surface whitespace-pre-line leading-relaxed">
                  {interpolateTemplate(previewTemplate.bodyTemplate, getPreviewVariables())}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-surface-container-lowest border-t border-outline-variant flex justify-end">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-1.5 rounded-xl bg-surface border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
