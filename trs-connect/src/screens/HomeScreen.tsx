import React from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import {
  ShieldCheck,
  HeartHandshake,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Radio,
  UserCheck
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    user,
    membership,
    events,
    issues,
    areaInfo,
    announcements,
    volunteerProfile,
    navigateTo,
    setActiveTab,
    toggleEventRsvp
  } = useApp();
  const { t } = useI18n();

  const isApprovedMember = membership?.status === 'approved';
  const isPendingMember = membership?.status === 'pending';
  const upcomingEventsPreview = events.slice(0, 2);
  const recentIssuesPreview = issues.slice(0, 2);

  return (
    <div className="pb-24 pt-2 px-4 space-y-4 max-w-md mx-auto">
      {/* 1. Welcome Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-4 top-4 opacity-15">
          <ShieldCheck className="w-24 h-24 text-amber-300" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-bold text-[10px] tracking-wider uppercase">
              {isApprovedMember
                ? 'OFFICIALLY VERIFIED MEMBER'
                : isPendingMember
                ? 'APPLICATION PENDING VERIFICATION'
                : 'CITIZEN GUEST'}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-100/90 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>{user?.ward || 'Ward 98, Jubilee Hills'}</span>
            </div>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            {t('welcome')}, {user?.fullName?.split(' ')[0] || 'Citizen'}!
          </h2>
          <p className="text-xs text-emerald-100/90 mt-0.5">
            Voluntary community engagement, civic grievance redressal & youth drives.
          </p>

          {/* User Metrics Bar */}
          <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-xl py-1.5 px-2">
              <span className="block text-sm font-black text-amber-300">
                {events.filter((e) => e.isRegistered).length}
              </span>
              <span className="text-[10px] text-emerald-100 font-medium">My RSVPs</span>
            </div>
            <div className="bg-white/10 rounded-xl py-1.5 px-2">
              <span className="block text-sm font-black text-amber-300">
                {issues.filter((i) => i.status === 'resolved').length}
              </span>
              <span className="text-[10px] text-emerald-100 font-medium">Resolved</span>
            </div>
            <div className="bg-white/10 rounded-xl py-1.5 px-2">
              <span className="block text-sm font-black text-amber-300">
                {volunteerProfile?.hoursLogged || 0} hrs
              </span>
              <span className="text-[10px] text-emerald-100 font-medium">Volunteered</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Membership Status Banner (Strictly Distinguishes Application, Pending & Approved) */}
      <div
        onClick={() => navigateTo('membership')}
        className={`border rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-all cursor-pointer relative overflow-hidden ${
          isApprovedMember
            ? 'bg-gradient-to-r from-emerald-50 via-amber-50/40 to-emerald-50 border-emerald-300'
            : isPendingMember
            ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-amber-300'
            : 'bg-white border-slate-200 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                isApprovedMember
                  ? 'bg-emerald-700 text-amber-300'
                  : isPendingMember
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isApprovedMember ? (
                <ShieldCheck className="w-7 h-7" />
              ) : isPendingMember ? (
                <Clock className="w-7 h-7" />
              ) : (
                <UserCheck className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-slate-900">
                  {isApprovedMember
                    ? 'Official Digital Membership Card'
                    : isPendingMember
                    ? 'Application Pending Verification'
                    : 'Voluntary Citizen Membership'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                {isApprovedMember
                  ? `Active Pass: ${membership?.membershipNumber} • Tap to view`
                  : isPendingMember
                  ? `Ref: ${membership?.applicationNumber} • Under committee review`
                  : 'Submit voluntary membership request for committee review'}
              </p>
            </div>
          </div>

          <button className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Quick Action 4-Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Volunteer Card */}
        <div
          onClick={() => navigateTo('volunteer')}
          className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs hover:border-amber-400 active:scale-95 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 leading-snug">
              Volunteer Wing
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Enlist in community aid
            </p>
          </div>
          <div className="mt-2.5 flex items-center text-[10px] font-bold text-amber-700 gap-1">
            <span>Join Action</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Youth Hub */}
        <div
          onClick={() => navigateTo('youth_hub')}
          className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs hover:border-emerald-400 active:scale-95 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 leading-snug">
              TRSV Youth Hub
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Sports, tech & leadership
            </p>
          </div>
          <div className="mt-2.5 flex items-center text-[10px] font-bold text-emerald-700 gap-1">
            <span>Explore Hub</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 4. My Area Spotlight Card */}
      <div
        onClick={() => setActiveTab('my_area')}
        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs cursor-pointer active:scale-[0.99] transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">
                {areaInfo.constituency}
              </h3>
              <p className="text-[10px] text-slate-500">Statutory Helplines & Ward Pulse</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
            Statutory 112 Active
          </span>
        </div>

        <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Representative</span>
            <span className="font-bold text-slate-700 text-xs truncate max-w-[180px] block">
              {areaInfo.mlaName}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">National Emergency</span>
            <span className="font-mono font-bold text-emerald-700 text-xs">112</span>
          </div>
        </div>
      </div>

      {/* 5. Citizen Issues Quick Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-emerald-700" />
            <h3 className="font-extrabold text-sm text-slate-900">
              {t('recentCitizenIssues')}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('issues')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            <span>{t('viewAll')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentIssuesPreview.map((issue) => (
            <div
              key={issue.id}
              onClick={() => setActiveTab('issues')}
              className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-300 transition-all flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {issue.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    issue.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : issue.status === 'assigned'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {issue.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                {issue.title}
              </h4>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[220px]">{issue.locationName}</span>
                </div>
                <span className="text-emerald-700 font-bold text-[10px]">Track Status →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Upcoming Events Spotlight */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <h3 className="font-extrabold text-sm text-slate-900">
              {t('upcomingEvents')}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('events')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            <span>{t('viewAll')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {upcomingEventsPreview.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs flex flex-col"
            >
              <div className="h-28 w-full relative overflow-hidden bg-slate-100">
                <img
                  src={evt.bannerUrl}
                  alt={evt.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-700 text-white font-bold text-[10px] tracking-wider uppercase">
                  {evt.category}
                </span>
                <span className="absolute bottom-2 left-2.5 text-xs font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{evt.date} • {evt.time}</span>
                </span>
              </div>

              <div className="p-3.5 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                    {evt.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">
                    Registration Open
                  </span>

                  <button
                    onClick={() => toggleEventRsvp(evt.id)}
                    className={`py-1.5 px-3.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center gap-1 ${
                      evt.isRegistered
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                    }`}
                  >
                    {evt.isRegistered ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pass Ready</span>
                      </>
                    ) : (
                      <span>RSVP Free</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Official Updates */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-emerald-700 animate-pulse" />
          <h3 className="font-extrabold text-sm text-slate-900">
            {t('officialUpdates')}
          </h3>
        </div>

        <div className="space-y-2">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-2xl p-3.5 border-l-4 border-l-emerald-600 border border-slate-200 shadow-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {ann.tag}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{ann.date}</span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 leading-snug">
                {ann.title}
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                {ann.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
