import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n, SupportedLanguage } from '../context/I18nContext';
import {
  ShieldCheck,
  Calendar,
  AlertCircle,
  HeartHandshake,
  Lock,
  Trash2,
  LogOut,
  ChevronRight,
  Download,
  X,
  Phone,
  Clock,
  FileText,
  MapPin
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    membership,
    events,
    issues,
    volunteerProfile,
    auditLogs,
    navigateTo,
    logout,
    deleteAccount,
    showToast
  } = useApp();
  const { language, setLanguage, t } = useI18n();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const languages: { code: SupportedLanguage; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' }
  ];

  const registeredEventsCount = events.filter((e) => e.isRegistered).length;
  const userIssuesCount = issues.filter((i) => !user || i.userId === user.id || i.userId === 'usr_dev_citizen').length;

  const handleDownloadData = () => {
    const citizenData = {
      profile: {
        id: user?.id || 'anonymous',
        fullName: user?.fullName || 'Not Provided',
        phone: user?.phone || 'Not Provided',
        constituency: user?.constituency || 'Jubilee Hills (AC-61)',
        ward: user?.ward || 'Ward 98',
        role: user?.role || 'MEMBER',
        registeredAt: user?.createdAt || new Date().toISOString()
      },
      membershipApplication: membership ? {
        referenceNumber: membership.applicationNumber,
        status: membership.status,
        membershipNumber: membership.membershipNumber || 'Pending Issuance',
        appliedDate: membership.appliedDate,
        approvedDate: membership.approvedDate || null
      } : null,
      volunteerProfile: volunteerProfile ? {
        domains: volunteerProfile.domains,
        availability: volunteerProfile.availability,
        skills: volunteerProfile.skills,
        hoursLogged: volunteerProfile.hoursLogged
      } : null,
      privacyCompliance: {
        nonProfilingVerified: true,
        dataMinimizationCompliant: true,
        sensitiveTraitsCollected: 'NONE'
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(citizenData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TRS_Connect_Data_Export_${Date.now()}.json`;
    a.click();
    showToast('Citizen privacy record export downloaded', 'success');
  };

  return (
    <div className="pb-24 pt-2 px-4 space-y-4 max-w-md mx-auto select-none">
      {/* 1. Citizen Profile Card Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-amber-300 font-black text-2xl flex items-center justify-center border-2 border-emerald-600 shadow-md flex-shrink-0">
            {user?.fullName?.charAt(0) || 'C'}
          </div>

          <div className="flex-1 overflow-hidden space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h2 className="font-extrabold text-base text-slate-900 truncate">
                {user?.fullName || 'Citizen User'}
              </h2>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {user?.role || 'MEMBER'}
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>+91 {user?.phone || 'Not Registered'}</span>
            </p>

            <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span className="truncate">{user?.constituency || 'Jubilee Hills (AC-61)'}</span>
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
          <div
            onClick={() => navigateTo('events')}
            className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <span className="block text-base font-black text-emerald-700">
              {registeredEventsCount}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">My RSVPs</span>
          </div>

          <div
            onClick={() => navigateTo('issues')}
            className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <span className="block text-base font-black text-emerald-700">
              {userIssuesCount}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">My Reports</span>
          </div>

          <div
            onClick={() => navigateTo('volunteer')}
            className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <span className="block text-base font-black text-amber-600">
              {volunteerProfile?.hoursLogged || 0}h
            </span>
            <span className="text-[10px] text-slate-500 font-bold">Volunteered</span>
          </div>
        </div>
      </div>

      {/* 2. Membership Status Banner (Strictly Distinguishes Application, Pending & Approved) */}
      <div
        onClick={() => navigateTo('membership')}
        className={`rounded-3xl p-4 text-white shadow-md cursor-pointer hover:shadow-lg transition-all space-y-2 relative overflow-hidden ${
          membership?.status === 'approved'
            ? 'bg-gradient-to-r from-emerald-800 to-green-900'
            : membership?.status === 'pending'
            ? 'bg-gradient-to-r from-amber-600 to-amber-700'
            : 'bg-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-slate-900">
            {membership?.status === 'approved'
              ? 'ACTIVE VERIFIED CARD'
              : membership?.status === 'pending'
              ? 'PENDING COMMITTEE VERIFICATION'
              : 'VOLUNTARY MEMBERSHIP'}
          </span>
          <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
            <span>{membership?.status === 'approved' ? 'View Card' : 'View Status'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div>
          <h3 className="font-extrabold text-sm tracking-wide">
            {membership?.memberName || 'Citizen Applicant'}
          </h3>
          <p className="text-[11px] font-mono text-emerald-100">
            {membership?.status === 'approved'
              ? `ID: ${membership.membershipNumber}`
              : membership?.status === 'pending'
              ? `Ref: ${membership.applicationNumber}`
              : 'Tap to apply for membership'}
          </p>
        </div>
      </div>

      {/* 3. My Activities Quick Links */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider px-1">
          My Civic Engagements
        </h4>

        <button
          onClick={() => navigateTo('events')}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Calendar className="w-4 h-4" />
            </div>
            <span>My Registered Events & Townhalls</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => navigateTo('volunteer')}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span>My Volunteer Record</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => navigateTo('issues')}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span>My Reported Ward Grievances</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 4. Language & App Settings */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider px-1">
          Language
        </h4>

        <div className="grid grid-cols-3 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                language === lang.code
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {lang.native}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Privacy, Security & Data Rights */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider px-1">
          Security & Privacy Protection
        </h4>

        <button
          onClick={() => setShowPrivacyModal(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-emerald-700" />
            <span>Privacy Policy & Consent Framework</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowTermsModal(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Terms of Voluntary Citizen Engagement</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={handleDownloadData}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download My Civic Data (JSON)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 6. Logout & Delete Account Actions */}
      <div className="space-y-2 pt-2">
        <button
          onClick={logout}
          className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>{t('logout')}</span>
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>{t('deleteAccount')}</span>
        </button>
      </div>

      {/* PRIVACY MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full max-h-[85vh] overflow-y-auto shadow-2xl relative border border-emerald-100 animate-scale-up space-y-3 no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Citizen Privacy Framework
                </h3>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-950 font-semibold">
                ✓ Strict Zero-Profiling Mandate
              </div>

              <p>
                <strong>1. No Political Persuasion Profiling:</strong> The platform does not profile citizen voting habits, infer ideological tendencies, or assign political scores.
              </p>

              <p>
                <strong>2. Sensitive Attributes Prohibited:</strong> We never collect or infer caste, religion, ethnicity, health status, or private beliefs.
              </p>

              <p>
                <strong>3. Location Privacy:</strong> Ward selection is approximate and used solely to route civic issues and show local helplines. No background GPS tracking is performed.
              </p>

              <p>
                <strong>4. Right to Erasure:</strong> You can permanently delete your profile and membership application at any time using the "Delete My Account & Data" action.
              </p>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
            >
              Close Privacy Statement
            </button>
          </div>
        </div>
      )}

      {/* TERMS MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full max-h-[85vh] overflow-y-auto shadow-2xl relative border border-slate-200 animate-scale-up space-y-3 no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Terms of Voluntary Engagement
                </h3>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>1. Voluntary Participation:</strong> All participation in membership, volunteering, and event attendance is completely voluntary.
              </p>
              <p>
                <strong>2. Verification Requirement:</strong> Membership passes are subject to authorized constituency committee review before issuance.
              </p>
              <p>
                <strong>3. Code of Conduct:</strong> Grievance reporting must be factual and civil. Abuse of the system for unlawful defamation is prohibited.
              </p>
            </div>

            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs"
            >
              Acknowledge Terms
            </button>
          </div>
        </div>
      )}

      {/* ACCOUNT DELETION CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl relative border border-rose-200 animate-scale-up space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-black text-sm text-slate-900 text-center">
              Permanent Account Deletion
            </h3>

            <p className="text-xs text-slate-600 text-center leading-relaxed">
              Are you sure you want to permanently erase your citizen profile, voluntary membership records, and volunteer activity? This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  deleteAccount();
                  setShowDeleteModal(false);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Delete My Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
