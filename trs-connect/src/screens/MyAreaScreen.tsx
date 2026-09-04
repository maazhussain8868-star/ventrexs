import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import {
  MapPin,
  ShieldCheck,
  Phone,
  Building,
  AlertCircle,
  Calendar,
  Lock,
  Info
} from 'lucide-react';

export const MyAreaScreen: React.FC = () => {
  const {
    areaInfo,
    locationPermissionGranted,
    grantLocationPermission,
    events,
    issues,
    setActiveTab
  } = useApp();
  const { t } = useI18n();

  const [selectedWard, setSelectedWard] = useState('Ward 98 (Venkatagiri)');

  return (
    <div className="pb-24 pt-2 px-4 space-y-4 max-w-md mx-auto select-none">
      {/* Top Header */}
      <div>
        <h2 className="text-lg font-black text-slate-900 leading-tight">
          {t('myAreaTitle')}
        </h2>
        <p className="text-xs text-slate-500">
          Constituency representation, statutory helplines & ward services
        </p>
      </div>

      {/* Permission Gate if revoked */}
      {!locationPermissionGranted ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900">
            Enable Hyperlocal Ward Discovery
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Select your ward to view local statutory emergency numbers and public service updates.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Strictly private: No GPS tracking history or profiling</span>
          </div>
          <button
            onClick={grantLocationPermission}
            className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Allow Ward Location Access
          </button>
        </div>
      ) : (
        <>
          {/* Constituency & Ward Selector */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-700 text-amber-300">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  CONSTITUENCY
                </span>
                <span className="font-extrabold text-xs text-slate-900">
                  {areaInfo.constituency}
                </span>
              </div>
            </div>

            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              {areaInfo.activeWards.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Local Representative Information (No fake invented leaders) */}
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-900 rounded-3xl p-5 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-[10px] uppercase tracking-wider">
                CONSTITUENCY REPRESENTATION
              </span>
              <span className="text-[10px] font-bold text-emerald-200">
                Official Directory
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-300/80 shadow-md flex-shrink-0 bg-emerald-950 flex items-center justify-center text-amber-300 font-black">
                <Building className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-white leading-snug">
                  {areaInfo.mlaName}
                </h3>
                <p className="text-xs text-amber-300 font-semibold">{areaInfo.mlaTitle}</p>
                <p className="text-[10px] text-emerald-100/80 mt-1 line-clamp-1">
                  {areaInfo.mlaOfficeAddress}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100">
              <span>Constituency Hotline:</span>
              <span className="font-semibold text-white/90">
                {areaInfo.mlaHelpline}
              </span>
            </div>
          </div>

          {/* Genuine Statutory Public Emergency Contacts (All Pan-India Statutory Numbers) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-rose-600" />
                <span>Statutory 24x7 Emergency Helplines</span>
              </h4>
              <span className="text-[10px] text-slate-400">Toll-Free</span>
            </div>

            <div className="space-y-2">
              {areaInfo.statutoryEmergencyContacts.map((contact) => (
                <div
                  key={contact.service}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">{contact.service}</span>
                    <span className="text-[10px] text-slate-400">{contact.description}</span>
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{contact.number}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Civic Services Quick Links */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('events')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left hover:border-emerald-500 active:scale-95 transition-all shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-slate-900 block">
                Ward Events
              </span>
              <span className="text-[10px] text-slate-500">
                View Townhalls & Meets
              </span>
            </button>

            <button
              onClick={() => setActiveTab('issues')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left hover:border-emerald-500 active:scale-95 transition-all shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-slate-900 block">
                Report Grievance
              </span>
              <span className="text-[10px] text-slate-500">
                Direct to Ward Desk
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
