import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import { MembershipRecord } from '../lib/types';
import {
  ShieldCheck,
  QrCode,
  Share2,
  Download,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck,
  ChevronRight,
  UserCheck,
  X,
  Lock,
  ArrowRight
} from 'lucide-react';

export const MembershipScreen: React.FC = () => {
  const {
    user,
    membership,
    submitMembershipApplication,
    adminReviewMembership,
    showToast,
    triggerConfetti
  } = useApp();
  const { t } = useI18n();

  // Wizard state: 1: Auth check -> 2: Profile details -> 3: Consent declaration
  const [isApplying, setIsApplying] = useState(!membership || membership.status === 'none');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [constituency, setConstituency] = useState(user?.constituency || 'Jubilee Hills (AC-61)');
  const [ward, setWard] = useState(user?.ward || 'Ward 98 (Venkatagiri)');
  const [category, setCategory] = useState<MembershipRecord['category']>('Youth Wing (TRSV)');
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showAdminReviewModal, setShowAdminReviewModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const constituencies = [
    'Jubilee Hills (AC-61)',
    'Khairatabad (AC-59)',
    'Serilingampally (AC-52)',
    'Kukatpally (AC-46)',
    'Sanathnagar (AC-60)',
    'Secunderabad (AC-70)',
    'Warangal East (AC-106)',
    'Karimnagar (AC-26)',
    'Nizamabad Urban (AC-17)'
  ];

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!consentAgreed) {
      showToast('Voluntary consent confirmation is mandatory', 'error');
      return;
    }

    submitMembershipApplication({
      fullName,
      constituency,
      ward,
      category
    });
    setIsApplying(false);
  };

  const handleShareCard = async () => {
    if (membership?.status !== 'approved') return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TRS Official Digital Membership Card',
          text: `Verified Member: ${membership.memberName} (${membership.membershipNumber})`,
          url: window.location.href
        });
      } catch (err) {
        showToast('Membership details copied to clipboard', 'info');
      }
    } else {
      navigator.clipboard?.writeText(
        `TRS Digital Membership Card: ${membership.memberName} | ID: ${membership.membershipNumber}`
      );
      showToast('Membership details copied to clipboard', 'success');
    }
  };

  const handleDownloadCard = () => {
    if (membership?.status !== 'approved') return;
    triggerConfetti();
    showToast('Authorized digital pass downloaded', 'success');
  };

  return (
    <div className="pb-24 pt-2 px-4 space-y-4 max-w-md mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-lg font-black text-slate-900 leading-tight">
            {t('membershipFlowTitle')}
          </h2>
          <p className="text-xs text-slate-500">Official Organization Membership Registry</p>
        </div>

        {membership && (
          <button
            onClick={() => setShowAdminReviewModal(true)}
            className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
          >
            <UserCheck className="w-3 h-3 text-amber-800" />
            <span>Review Panel</span>
          </button>
        )}
      </div>

      {/* STATE 1: NEW APPLICATION WIZARD */}
      {isApplying || !membership ? (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              STEP 1 OF 2: APPLICATION
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-2">
              Voluntary Membership Registration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your details. All applications undergo authorized committee verification prior to card activation.
            </p>
          </div>

          <form onSubmit={handleSubmitApplication} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name as on identity documents"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Constituency
              </label>
              <select
                value={constituency}
                onChange={(e) => setConstituency(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {constituencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ward / Local Area
              </label>
              <input
                type="text"
                required
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="e.g. Ward 98, Jubilee Hills"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Wing Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
              >
                <option value="Youth Wing (TRSV)">Youth Wing (TRSV)</option>
                <option value="General Citizen">General Citizen</option>
                <option value="Women Empowerment">Women Wing</option>
                <option value="Senior Citizen">Senior Citizen</option>
              </select>
            </div>

            {/* Mandatory Voluntary Consent */}
            <div className="pt-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-slate-700 space-y-2">
              <span className="font-bold text-emerald-950 block">
                Statutory Voluntary Consent:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-600">
                I hereby voluntarily apply for primary membership. I understand that submitting an application does not automatically confer membership, and is subject to verification by the authorized constituency review committee.
              </p>
              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-emerald-900">
                  I agree to the voluntary code of conduct and consent terms.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!consentAgreed || !fullName.trim()}
              className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <span>Submit for Committee Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : membership.status === 'pending' ? (
        /* STATE 2: PENDING VERIFICATION */
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>PENDING VERIFICATION</span>
              </span>
              <span className="text-[10px] font-bold text-amber-800">
                Stage 2 of 3
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Application Under Committee Review
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Your voluntary application has been logged in the central membership registry and assigned to the authorized constituency verification committee.
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200/70 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Application Reference:</span>
                <span className="font-mono font-bold text-slate-900">{membership.applicationNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Applicant Name:</span>
                <span className="font-bold text-slate-900">{membership.memberName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Constituency:</span>
                <span className="font-bold text-slate-900">{membership.constituency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Submission Date:</span>
                <span className="font-bold text-slate-900">{membership.appliedDate}</span>
              </div>
            </div>

            {/* Verification Timeline */}
            <div className="p-3 bg-white/70 rounded-2xl border border-amber-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Application Logged</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Electoral & Identity Review (Underway)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">3</div>
                <span>Authorized Approval & Card Activation (Pending)</span>
              </div>
            </div>

            {/* Warning that card is locked */}
            <div className="p-3 rounded-2xl bg-amber-100/60 border border-amber-300/60 flex items-start gap-2 text-xs text-amber-950">
              <Lock className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-snug">
                <strong>Card Inactive:</strong> The Digital Membership Card and security QR code will only be issued once authorized approval is finalized by the committee.
              </p>
            </div>
          </div>
        </div>
      ) : membership.status === 'approved' ? (
        /* STATE 3: OFFICIALLY APPROVED DIGITAL CARD */
        <div className="space-y-4">
          <div className="relative rounded-[28px] bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 p-6 text-white shadow-2xl border-2 border-amber-400/70 overflow-hidden membership-card-glow">
            {/* Background Texture */}
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-start justify-between relative z-10 border-b border-white/15 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-white p-1 border-2 border-amber-400 shadow-md">
                  <div className="w-full h-full rounded-xl bg-emerald-800 flex items-center justify-center font-black text-amber-400 text-sm">
                    TRS
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide text-white drop-shadow-sm">
                    {t('digitalCardHeader')}
                  </h3>
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                    AUTHORIZED PRIMARY IDENTITY
                  </span>
                </div>
              </div>

              {/* Holographic Chip Effect */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-500 border border-amber-200 shadow-inner flex items-center justify-center opacity-90">
                <div className="w-6 h-4 border border-amber-700/40 rounded-xs grid grid-cols-2 gap-0.5" />
              </div>
            </div>

            {/* Member Details */}
            <div className="my-5 relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-amber-300 shadow-md overflow-hidden bg-emerald-950 flex items-center justify-center font-black text-amber-300 text-xl">
                {membership.memberName.charAt(0)}
              </div>

              <div className="flex-1 overflow-hidden space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950">
                  {membership.category}
                </span>

                <h4 className="font-black text-base text-white truncate drop-shadow-sm">
                  {membership.memberName}
                </h4>

                <div className="text-[11px] text-emerald-100 font-medium">
                  <span className="text-amber-300 font-bold">MEMBER ID: </span>
                  <span className="font-mono tracking-wider font-bold">
                    {membership.membershipNumber}
                  </span>
                </div>

                <div className="text-[10px] text-emerald-200 truncate">
                  {membership.constituency} • {membership.ward}
                </div>
              </div>
            </div>

            {/* Card Footer with QR trigger */}
            <div className="pt-4 border-t border-white/15 relative z-10 flex items-end justify-between">
              <div className="space-y-1">
                <div className="text-[10px] text-emerald-200">
                  <span className="text-white/60">APPROVED: </span>
                  <span className="font-bold text-white">{membership.approvedDate}</span>
                </div>
                <div className="text-[10px] text-emerald-200">
                  <span className="text-white/60">VALID TILL: </span>
                  <span className="font-bold text-amber-300">{membership.validTill}</span>
                </div>
                <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>OFFICIALLY VERIFIED</span>
                </div>
              </div>

              <button
                onClick={() => setShowQrModal(true)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 shadow-lg flex flex-col items-center gap-0.5 active:scale-95 transition-all cursor-pointer"
              >
                <QrCode className="w-8 h-8 text-emerald-900" />
                <span className="text-[8px] font-black text-emerald-950 uppercase">
                  TAP TO SCAN
                </span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShareCard}
              className="py-3 px-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-600 text-slate-800 font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>{t('shareCard')}</span>
            </button>

            <button
              onClick={handleDownloadCard}
              className="py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{t('downloadCard')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* STATE 4: REJECTED OR SUSPENDED */
        <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900">
            Membership Status: {membership.status.toUpperCase()}
          </h3>
          <p className="text-xs text-slate-600">
            {membership.reviewNotes || 'Verification could not be confirmed by the constituency committee.'}
          </p>
          <button
            onClick={() => setIsApplying(true)}
            className="py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition-all"
          >
            Submit New Application
          </button>
        </div>
      )}

      {/* ADMIN REVIEW DRAWER / MODAL */}
      {showAdminReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl relative border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Authorized Admin Review Panel
                </h3>
              </div>
              <button
                onClick={() => setShowAdminReviewModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Simulate authorized constituency verification committee decisions. In production, this operation is restricted server-side by Supabase RLS to MODERATOR / ADMIN roles.
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div><strong>Applicant:</strong> {membership?.memberName}</div>
              <div><strong>Status:</strong> {membership?.status.toUpperCase()}</div>
              <div><strong>Reference:</strong> {membership?.applicationNumber}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Committee Verification Notes
              </label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Verified by Ward 98 Convener"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  adminReviewMembership('rejected', adminNotes);
                  setShowAdminReviewModal(false);
                }}
                className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200"
              >
                Reject
              </button>

              <button
                onClick={() => {
                  adminReviewMembership('approved', adminNotes);
                  setShowAdminReviewModal(false);
                }}
                className="py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
              >
                Authorize & Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL (ACTIVE ONLY IF APPROVED) */}
      {showQrModal && membership?.status === 'approved' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center relative border border-emerald-100 animate-scale-up">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <QrCode className="w-7 h-7" />
            </div>

            <h3 className="font-extrabold text-sm text-slate-900">
              Verified Digital Security QR
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Authorized Member ID: {membership.membershipNumber}
            </p>

            <div className="my-5 p-3 rounded-2xl bg-slate-50 border border-slate-200 inline-block shadow-inner">
              <img
                src={membership.qrCodeUrl}
                alt="Member QR Code"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <p className="text-[10px] text-slate-400 mt-1">
              Encrypted verification token verifiable by official scanning terminal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
