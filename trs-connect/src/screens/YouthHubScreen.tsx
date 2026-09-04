import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import {
  Sparkles,
  Calendar,
  Award,
  CheckCircle2,
  Flame,
  Medal,
  ChevronRight,
  MapPin
} from 'lucide-react';

export const YouthHubScreen: React.FC = () => {
  const { youthActivities, enrollInYouthActivity, navigateTo } = useApp();
  const { t } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Sports' | 'Hackathon' | 'Leadership'>('All');

  const filteredActivities = youthActivities.filter((act) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Sports') return act.category.includes('Sports');
    if (selectedFilter === 'Hackathon') return act.category.includes('Hackathon');
    if (selectedFilter === 'Leadership') return act.category.includes('Leadership');
    return true;
  });

  return (
    <div className="pb-24 pt-2 px-4 space-y-4 max-w-md mx-auto select-none">
      {/* Top Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-emerald-800 p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-950 font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>TRSV YOUTH WING</span>
          </span>
          <span className="text-[10px] font-bold text-amber-200">
            Telangana Rising
          </span>
        </div>

        <h2 className="text-xl font-black tracking-tight drop-shadow-sm">
          {t('youthHubTitle')}
        </h2>
        <p className="text-xs text-amber-100 mt-0.5">
          {t('youthTagline')}
        </p>

        {/* Youth Stats Bar */}
        <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-center">
          <div className="bg-white/15 rounded-xl py-1.5 px-2">
            <span className="block text-sm font-black text-amber-200">
              {youthActivities.filter((a) => a.isEnrolled).reduce((acc, curr) => acc + curr.points, 0)}
            </span>
            <span className="text-[10px] text-white/90 font-medium">Earned Points</span>
          </div>
          <div className="bg-white/15 rounded-xl py-1.5 px-2">
            <span className="block text-sm font-black text-amber-200">
              {youthActivities.filter((a) => a.isEnrolled).length}
            </span>
            <span className="text-[10px] text-white/90 font-medium">Enrolled Meets</span>
          </div>
        </div>
      </div>

      {/* Volunteer Wing Cross-promotion Pill */}
      <div
        onClick={() => navigateTo('volunteer')}
        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-amber-300 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-emerald-950">Youth Volunteer Wing</h4>
            <p className="text-[10px] text-emerald-700">Lead community welfare & social impact</p>
          </div>
        </div>
        <div className="flex items-center text-xs font-bold text-emerald-800 gap-1">
          <span>Apply</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {(['All', 'Sports', 'Hackathon', 'Leadership'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === filter
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Activity Cards List */}
      <div className="space-y-3">
        {filteredActivities.map((act) => (
          <div
            key={act.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                {act.category}
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                +{act.points} PTS
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                {act.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {act.description}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span>{act.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{act.venue}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Open to Verified Youth</span>

              <button
                onClick={() => enrollInYouthActivity(act.id)}
                className={`py-2 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5 ${
                  act.isEnrolled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                }`}
              >
                {act.isEnrolled ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enrolled (Active)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Enroll Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Participation History & Badges */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
          <Medal className="w-4 h-4 text-amber-500" />
          <span>Youth Badges & Development Tracks</span>
        </h4>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-1 text-xs font-bold">
              🏏
            </div>
            <span className="block font-bold text-[10px] text-emerald-950">Sports Wing</span>
            <span className="text-[9px] text-slate-500">Youth Fitness</span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-1 text-xs font-bold">
              💻
            </div>
            <span className="block font-bold text-[10px] text-amber-950">Civic Tech</span>
            <span className="text-[9px] text-slate-500">Innovation Track</span>
          </div>

          <div className="p-2.5 rounded-xl bg-green-50 border border-green-100">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-1 text-xs font-bold">
              🌱
            </div>
            <span className="block font-bold text-[10px] text-green-950">Haritha Haram</span>
            <span className="text-[9px] text-slate-500">Green Drive</span>
          </div>
        </div>
      </div>
    </div>
  );
};
