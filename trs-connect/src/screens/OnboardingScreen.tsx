import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import { ShieldCheck, HeartHandshake, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const { t } = useI18n();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: <ShieldCheck className="w-14 h-14 text-emerald-600" />,
      badge: 'OFFICIAL IDENTITY',
      title: 'Voluntary Membership & Verified Digital Card',
      description:
        'Become a recognized party member with an instant secure digital pass, verified constituency identity, and civic participation rights.',
      color: 'bg-emerald-50 border-emerald-200'
    },
    {
      icon: <HeartHandshake className="w-14 h-14 text-amber-500" />,
      badge: 'YOUTH & COMMUNITY',
      title: 'Volunteer Missions & Youth Hub Programs',
      description:
        'Participate in sports leagues, tech hackathons, medical camps, and community green drives across Telangana.',
      color: 'bg-amber-50 border-amber-200'
    },
    {
      icon: <AlertCircle className="w-14 h-14 text-green-700" />,
      badge: 'CITIZEN FIRST',
      title: 'Direct Civic Issue Redressal & Tracking',
      description:
        'Report roads, drainage, water supply, and streetlights with photos and GPS. Track live progress from submission to resolution.',
      color: 'bg-emerald-50 border-emerald-200'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      navigateTo('login');
    }
  };

  return (
    <div className="min-h-[750px] flex-1 bg-white text-slate-900 flex flex-col justify-between p-6 select-none">
      {/* Top Header with Skip */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-700 text-amber-300 font-extrabold text-xs flex items-center justify-center">
            TRS
          </div>
          <span className="font-extrabold text-xs text-emerald-950 tracking-wider">
            TRS CONNECT
          </span>
        </div>
        <button
          onClick={() => navigateTo('login')}
          className="text-xs font-bold text-slate-400 hover:text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-50 transition-colors"
        >
          Skip Intro
        </button>
      </div>

      {/* Main Slide Card */}
      <div className="my-auto py-6">
        <div
          className={`p-8 rounded-3xl border ${slides[currentSlide].color} shadow-sm transition-all duration-300 flex flex-col items-center text-center`}
        >
          <div className="w-24 h-24 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 border border-slate-100">
            {slides[currentSlide].icon}
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-700 text-white font-extrabold text-[10px] tracking-wider uppercase mb-3">
            {slides[currentSlide].badge}
          </span>

          <h2 className="text-xl font-extrabold text-emerald-950 mb-3 leading-snug">
            {slides[currentSlide].title}
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Bullet Checkpoints */}
        <div className="mt-6 flex flex-col gap-2 px-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>100% voluntary & free citizen participation</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Strict privacy: No political persuasion profiling</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-5 pb-4">
        {/* Step Indicator dots */}
        <div className="flex justify-center items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-200'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-center text-slate-400">
          By continuing, you agree to the Voluntary Citizen Code & Privacy Terms
        </p>
      </div>
    </div>
  );
};
