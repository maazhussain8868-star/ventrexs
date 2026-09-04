import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import { VolunteerApplication } from '../lib/types';
import {
  HeartHandshake,
  Clock,
  CheckCircle2,
  Shield,
  ArrowRight,
  Info
} from 'lucide-react';

export const VolunteerScreen: React.FC = () => {
  const {
    volunteerProfile,
    volunteerMissions,
    applyForVolunteer,
    enlistInMission,
    showToast
  } = useApp();
  const { t } = useI18n();

  const [isRegistering, setIsRegistering] = useState(!volunteerProfile);
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    volunteerProfile?.domains || ['Field Organizing & Digital Help', 'Youth Engagement']
  );
  const [availability, setAvailability] = useState<VolunteerApplication['availability']>(
    volunteerProfile?.availability || 'Weekends Only'
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    volunteerProfile?.skills || ['Event Logistics', 'Social Media Coordination']
  );

  const domainOptions = [
    'Field Organizing & Digital Help',
    'Youth Engagement',
    'Disaster & Community Aid',
    'Environmental & Tree Drives',
    'Social Media & Digital Awareness',
    'Elderly Assistance & Civic Literacy'
  ];

  const skillOptions = [
    'Event Logistics',
    'Social Media Coordination',
    'Public Speaking',
    'Community Organizing',
    'Photography & Media',
    'Language Translation'
  ];

  const toggleDomain = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter((d) => d !== domain));
    } else {
      setSelectedDomains([...selectedDomains, domain]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDomains.length === 0) {
      showToast('Please select at least one interest domain', 'error');
      return;
    }
    applyForVolunteer({
      domains: selectedDomains,
      availability,
      skills: selectedSkills
    });
    setIsRegistering(false);
  };

  return (
    <div className="pb-24 pt-2 px-4 space-y-4 max-w-md mx-auto select-none">
      {/* Top Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-900 p-5 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-[10px] tracking-wider uppercase">
            SEVA WING
          </span>
          <span className="text-[10px] font-bold text-emerald-200">
            Voluntary Citizen Service
          </span>
        </div>

        <h2 className="text-xl font-black tracking-tight drop-shadow-sm">
          {t('volunteerTitle')}
        </h2>
        <p className="text-xs text-emerald-100 mt-0.5">
          Dedicate your voluntary skills to community aid, green drives, and youth guidance.
        </p>

        {volunteerProfile && (
          <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-xl py-1.5 px-2">
              <span className="block text-sm font-black text-amber-300">
                {volunteerProfile.hoursLogged} hrs
              </span>
              <span className="text-[10px] text-white font-medium">Logged Time</span>
            </div>
            <div className="bg-white/10 rounded-xl py-1.5 px-2">
              <span className="block text-sm font-black text-amber-300">
                {volunteerProfile.missionsCompleted}
              </span>
              <span className="text-[10px] text-white font-medium">Missions Done</span>
            </div>
            <div className="bg-white/10 rounded-xl py-1.5 px-2">
              <span className="block text-sm font-black text-amber-300">Active</span>
              <span className="text-[10px] text-white font-medium">Status</span>
            </div>
          </div>
        )}
      </div>

      {/* Registration or Active Volunteer Mode */}
      {isRegistering ? (
        <form
          onSubmit={handleRegister}
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
              DATA MINIMIZATION COMPLIANT
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
              Volunteer Enrollment
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Only information necessary for volunteer coordination is requested. Sensitive personal data is strictly excluded.
            </p>
          </div>

          {/* Interest Domains Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Voluntary Focus Areas
            </label>
            <div className="flex flex-wrap gap-1.5">
              {domainOptions.map((domain) => {
                const isSelected = selectedDomains.includes(domain);
                return (
                  <button
                    type="button"
                    key={domain}
                    onClick={() => toggleDomain(domain)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {domain}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Time Commitment
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="Weekends Only">Weekends Only</option>
              <option value="Flexible Evenings">Flexible Evenings (2-3 hrs)</option>
              <option value="On-Call Emergencies">On-Call for Emergency Relief</option>
              <option value="Full-Time Active">Full-Time Active</option>
            </select>
          </div>

          {/* Skills Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Key Relevant Skills
            </label>
            <div className="flex flex-wrap gap-1.5">
              {skillOptions.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data Minimization Note */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <p>
              In compliance with privacy standards, blood group and emergency contact details are omitted.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-lg shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 text-amber-300" />
            <span>Complete Volunteer Enrollment</span>
          </button>
        </form>
      ) : (
        /* OPEN MISSIONS */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              Community Volunteer Missions
            </h3>
            <button
              onClick={() => setIsRegistering(true)}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Update Preferences
            </button>
          </div>

          <div className="space-y-3">
            {volunteerMissions.map((mission) => (
              <div
                key={mission.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {mission.domain}
                  </span>
                  <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>+{mission.hoursCredit} hrs credit</span>
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                    {mission.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {mission.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>{mission.date}</span>

                  <button
                    onClick={() => enlistInMission(mission.id)}
                    disabled={mission.status === 'enlisted'}
                    className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center gap-1 ${
                      mission.status === 'enlisted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                    }`}
                  >
                    {mission.status === 'enlisted' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Enlisted</span>
                      </>
                    ) : (
                      <span>Enlist in Mission</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Conduct & Ethics */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2 text-xs text-slate-600">
            <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>Voluntary Conduct Standards</span>
            </h4>
            <p className="text-[11px] leading-relaxed">
              Volunteers act on a purely voluntary, secular, and civic welfare basis without remuneration, promoting public cleanliness, tree plantation, and civic issue reporting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
