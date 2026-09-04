import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import { EngagementEvent } from '../lib/types';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  QrCode,
  X,
  Sparkles,
  Ticket
} from 'lucide-react';

export const EventsScreen: React.FC = () => {
  const { events, toggleEventRsvp, user, showToast } = useApp();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<'all' | 'registered'>('all');
  const [selectedEvent, setSelectedEvent] = useState<EngagementEvent | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  const displayedEvents = events.filter((evt) => {
    if (activeTab === 'registered') return evt.isRegistered;
    return true;
  });

  const openPass = (evt: EngagementEvent) => {
    setSelectedEvent(evt);
    setShowPassModal(true);
  };

  return (
    <div className="pb-24 pt-2 px-4 space-y-4 max-w-md mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 leading-tight">
            {t('eventsTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            Townhalls, welfare camps & youth gatherings
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          {events.filter((e) => e.isRegistered).length} RSVPs Confirmed
        </span>
      </div>

      {/* Tab Switcher: All Events vs My Registered Events */}
      <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-2xl">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'all'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('allEvents')} ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('registered')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'registered'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('registeredEvents')} ({events.filter((e) => e.isRegistered).length})
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3.5">
        {displayedEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
            <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">No RSVPs Yet</h4>
            <p className="text-xs text-slate-500">
              Browse "All Events" and register for community welfare camps and townhalls.
            </p>
          </div>
        ) : (
          displayedEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col"
            >
              {/* Event Image Banner */}
              <div className="h-36 w-full relative overflow-hidden bg-slate-100">
                <img
                  src={evt.bannerUrl}
                  alt={evt.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-black text-[10px] tracking-wider uppercase shadow-sm">
                  {evt.category}
                </span>

                {evt.isRegistered && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>RSVP CONFIRMED</span>
                  </span>
                )}

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span>{evt.date}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{evt.time}</span>
                  </span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {evt.description}
                  </p>
                </div>

                {/* Location & Speaker */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{evt.speakerInfo}</span>
                  </div>
                </div>

                {/* Registration Info */}
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Free Citizen Entry</span>
                  <span className="font-semibold text-emerald-800">RSVP Open</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  {evt.isRegistered ? (
                    <button
                      onClick={() => openPass(evt)}
                      className="py-2 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <QrCode className="w-4 h-4 text-amber-700" />
                      <span>View Entry Pass</span>
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-medium">
                      Tap Register for Entry Pass
                    </div>
                  )}

                  <button
                    onClick={() => toggleEventRsvp(evt.id)}
                    className={`py-2 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5 ${
                      evt.isRegistered
                        ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md'
                    }`}
                  >
                    {evt.isRegistered ? (
                      <span>Cancel RSVP</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{t('registerBtn')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EVENT PASS QR MODAL */}
      {showPassModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center relative border border-emerald-100 animate-scale-up">
            <button
              onClick={() => setShowPassModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-amber-300 mx-auto flex items-center justify-center mb-2">
              <Ticket className="w-5 h-5" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
              OFFICIAL ENTRY PASS
            </span>

            <h3 className="font-black text-sm text-slate-900 mt-2 leading-tight">
              {selectedEvent.title}
            </h3>

            <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PASS-${selectedEvent.id}-${user?.id || 'citizen'}`}
                alt="Event QR Pass"
                className="w-40 h-40 mx-auto rounded-lg"
              />
            </div>

            <div className="text-xs text-slate-700 font-bold bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-100">
              Pass Ref: PASS-{selectedEvent.id.toUpperCase()}
            </div>

            <div className="mt-3 text-[11px] text-slate-500 space-y-0.5">
              <p>Venue: {selectedEvent.venue}</p>
              <p>Date: {selectedEvent.date} ({selectedEvent.time})</p>
            </div>

            <button
              onClick={() => {
                showToast('Event pass saved to device', 'success');
                setShowPassModal(false);
              }}
              className="w-full mt-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
            >
              Save Pass to Phone
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
