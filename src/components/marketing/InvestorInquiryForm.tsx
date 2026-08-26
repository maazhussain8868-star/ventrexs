'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Mail,
  User,
  Briefcase,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { submitBuyerInquiryAction, BuyerInquiryPayload } from '@/app/actions/inquiry';

export default function InvestorInquiryForm() {
  const [formData, setFormData] = useState<BuyerInquiryPayload>({
    name: '',
    email: '',
    company: '',
    role: '',
    interest: 'Acquisition',
    message: '',
    honeypot: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setValidationErrors({});

    try {
      const result = await submitBuyerInquiryAction(formData);
      if (result.success) {
        setSuccessMessage(result.message);
        setFormData({
          name: '',
          email: '',
          company: '',
          role: '',
          interest: 'Acquisition',
          message: '',
          honeypot: '',
        });
      } else {
        setErrorMessage(result.message);
        if (result.errors) {
          setValidationErrors(result.errors);
        }
      }
    } catch (err: any) {
      setErrorMessage('An unexpected error occurred. Please try submitting again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-slate-800 backdrop-blur-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-3">
            <Lock className="w-3.5 h-3.5" /> Confidential Inquiry Channel
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Build the next layer of your financial operations.
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Directly connect regarding acquisition, strategic investment, partnership opportunities, or technical evaluation.
          </p>
        </div>

        {/* Success Confirmation State */}
        {successMessage ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Inquiry Received</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              {successMessage}
            </p>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* General Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Hidden Honeypot Input for anti-spam bots */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website_hp">Leave this empty</label>
              <input
                id="website_hp"
                type="text"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Row 1: Name & Work Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    validationErrors.name ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. s.jenkins@acquisitions.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    validationErrors.email ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.email}</p>
                )}
              </div>
            </div>

            {/* Row 2: Company & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> Organization / Fund
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Horizon Capital Partners"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Your Role / Title
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Partner / Principal / Corporate Dev"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Row 3: Primary Interest Category */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> Primary Area of Interest *
              </label>
              <select
                value={formData.interest}
                onChange={(e) => setFormData({ ...formData, interest: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="Acquisition">Full Asset / Codebase Acquisition</option>
                <option value="Investment">Strategic Growth Investment</option>
                <option value="Partnership">Commercial / Distribution Partnership</option>
                <option value="Product / Technology">Technical Evaluation / Due Diligence</option>
                <option value="Other">Other Strategic Discussion</option>
              </select>
            </div>

            {/* Row 4: Message / Inquiry Scope */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Message / Scope of Discussion *
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please provide details regarding your firm, timeline, interest in Ventrexs AI, and any specific technical or commercial inquiries."
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none ${
                  validationErrors.message ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {validationErrors.message && (
                <p className="text-[11px] text-rose-400 mt-1">{validationErrors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Secure Transmission...</span>
                </>
              ) : (
                <>
                  <span>Submit Confidential Inquiry</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-500 text-center font-mono pt-1">
              Encrypted Transmission • Zero Public Disclosure • Direct Founder/Leadership Routing
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
