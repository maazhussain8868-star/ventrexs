'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Wrench,
  Shield,
  Zap,
  Sparkles,
  Building2,
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Lock,
  Layers,
  Send,
  Radio,
  Sliders,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  TRADE_PRESETS,
  BusinessTradeType,
  buildDemoReceptionistSettings,
} from '@/lib/receptionist/demo-presets';
import { trackDemoEvent } from '@/lib/analytics/demo-tracker';
import { ExtractedCustomerInfo, ReceptionistIntent, ConversationState } from '@/types';

interface ChatTurn {
  id: string;
  sender: 'AI' | 'CUSTOMER';
  text: string;
  timestamp: string;
  detectedIntent?: ReceptionistIntent;
}

type DemoStep = 'SETUP' | 'CALL' | 'RESULT';

const TRADE_ICONS: Record<BusinessTradeType, any> = {
  HVAC: Flame,
  Plumbing: Wrench,
  Roofing: Shield,
  Electrical: Zap,
  Cleaning: Sparkles,
  Other: Building2,
};

export default function PublicReceptionistDemo() {
  const router = useRouter();

  // Step state
  const [currentStep, setCurrentStep] = useState<DemoStep>('SETUP');

  // Step 1: Business Setup State
  const [selectedTrade, setSelectedTrade] = useState<BusinessTradeType>('HVAC');
  const [businessName, setBusinessName] = useState<string>(TRADE_PRESETS.HVAC.defaultBusinessName);
  const [businessPhone, setBusinessPhone] = useState<string>('');

  // Step 2: Voice Demo State
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [hasMicSupport, setHasMicSupport] = useState<boolean>(true);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean>(false);

  // Intelligence State
  const [conversationState, setConversationState] = useState<ConversationState>('NEW');
  const [detectedIntent, setDetectedIntent] = useState<ReceptionistIntent>('GENERAL_QUESTION');
  const [confidence, setConfidence] = useState<number>(0.95);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedCustomerInfo>({});
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);
  const [handoffRequired, setHandoffRequired] = useState<boolean>(false);
  const [leadId, setLeadId] = useState<string | undefined>(undefined);

  // UI helpers
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Active preset
  const activePreset = useMemo(() => {
    return TRADE_PRESETS[selectedTrade] || TRADE_PRESETS.HVAC;
  }, [selectedTrade]);

  // Track page view on mount
  useEffect(() => {
    trackDemoEvent('demo_page_viewed', {
      business_type: selectedTrade,
      business_name: businessName,
    });
  }, []);

  // Update business name when trade changes if untouched
  const handleTradeSelect = (trade: BusinessTradeType) => {
    setSelectedTrade(trade);
    const newPreset = TRADE_PRESETS[trade];
    setBusinessName(newPreset.defaultBusinessName);
  };

  // Timer logic for live call duration
  useEffect(() => {
    if (currentStep === 'CALL') {
      timerRef.current = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentStep]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing, isAiSpeaking]);

  // Initialize Speech Synthesis & Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = false;
          rec.interimResults = false;
          rec.lang = 'en-US';

          rec.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
              handleSendCustomerMessage(transcript);
            }
            setIsListening(false);
          };

          rec.onerror = (err: any) => {
            console.debug('[SpeechRecognition error]', err);
            setIsListening(false);
          };

          rec.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = rec;
        } catch (e) {
          console.debug('[SpeechRecognition init failed]', e);
          setHasMicSupport(false);
        }
      } else {
        setHasMicSupport(false);
      }
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice output synthesizer
  const speakText = (text: string) => {
    if (isAudioMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.02;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick natural US English voice if available
      const voices = window.speechSynthesis.getVoices();
      const usVoice = voices.find(
        (v) =>
          (v.lang === 'en-US' || v.lang === 'en_US') &&
          (v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Jenny') ||
            v.name.includes('Guy') ||
            v.name.includes('Google US English'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (usVoice) {
        utterance.voice = usVoice;
      }

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.debug('[SpeechSynthesis speak error]', err);
      setIsAiSpeaking(false);
    }
  };

  // Toggle Microphone
  const toggleMicrophone = () => {
    if (!recognitionRef.current) {
      alert('Microphone speech recognition is not supported in this browser. You can click the quick prompt chips or type your message below!');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          setIsAiSpeaking(false);
        }
        recognitionRef.current.start();
        setIsListening(true);
        setMicPermissionGranted(true);
      } catch (err) {
        console.debug('[Recognition start error]', err);
        setIsListening(false);
      }
    }
  };

  // Step 1 -> Step 2: Start Demo
  const handleStartDemo = () => {
    const activeName = businessName.trim() || activePreset.defaultBusinessName;
    const newConvId = `conv-${Date.now().toString(36)}`;
    setConversationId(newConvId);
    setCallDurationSeconds(0);

    const greetingText = activePreset.suggestedGreeting.replace(
      activePreset.defaultBusinessName,
      activeName
    );

    const initialAiMessage: ChatTurn = {
      id: `ai-init-${Date.now()}`,
      sender: 'AI',
      text: greetingText,
      timestamp: 'Just now',
      detectedIntent: 'GENERAL_QUESTION',
    };

    setMessages([initialAiMessage]);
    setConversationState('NEW');
    setDetectedIntent('GENERAL_QUESTION');
    setConfidence(0.95);
    setExtractedInfo({});
    setSuggestedSlots([]);
    setHandoffRequired(false);
    setLeadId(undefined);

    setCurrentStep('CALL');

    trackDemoEvent('business_setup_completed', {
      business_type: selectedTrade,
      business_name: activeName,
    });

    trackDemoEvent('ai_demo_started', {
      business_type: selectedTrade,
      business_name: activeName,
    });

    // Voice greeting
    setTimeout(() => {
      speakText(greetingText);
    }, 400);
  };

  // Handle sending a message in the voice call
  const handleSendCustomerMessage = async (customText?: string) => {
    const text = (customText || inputMessage).trim();
    if (!text || isProcessing) return;

    // Stop speaking while user sends
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }

    const userTurn: ChatTurn = {
      id: `user-${Date.now()}`,
      sender: 'CUSTOMER',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userTurn]);
    if (!customText) setInputMessage('');
    setIsProcessing(true);

    try {
      const activeName = businessName.trim() || activePreset.defaultBusinessName;

      const res = await fetch('/api/demo/receptionist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: activeName,
          businessType: selectedTrade,
          businessPhone,
          conversationId,
          message: text,
          conversationState,
          customerName: extractedInfo.name,
          customerPhone: extractedInfo.phone,
          customerAddress: extractedInfo.address,
          serviceRequested: extractedInfo.serviceRequested,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const {
          replyText,
          state,
          detectedIntent: newIntent,
          confidence: newConf,
          extractedInfo: newExtracted,
          suggestedSlots: newSlots,
          handoffRequired: isHandoff,
          leadId: newLeadId,
        } = json.data;

        const aiTurn: ChatTurn = {
          id: `ai-${Date.now()}`,
          sender: 'AI',
          text: replyText,
          timestamp: 'Just now',
          detectedIntent: newIntent,
        };

        setMessages((prev) => [...prev, aiTurn]);
        setConversationState(state);
        if (newIntent) setDetectedIntent(newIntent);
        if (newConf) setConfidence(newConf);
        if (newExtracted) setExtractedInfo(newExtracted);
        if (newSlots) setSuggestedSlots(newSlots);
        setHandoffRequired(isHandoff);
        if (newLeadId) setLeadId(newLeadId);

        // Voice reply
        speakText(replyText);
      } else {
        const fallbackText = "I have noted that for our service team. Would you like us to schedule a technician to come out?";
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'AI',
            text: fallbackText,
            timestamp: 'Just now',
          },
        ]);
        speakText(fallbackText);
      }
    } catch (err) {
      console.error('[Demo chat error]', err);
      const fallbackText = "I understand. I can help get a technician out to inspect that for you. What is your full name and best callback number?";
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'AI',
          text: fallbackText,
          timestamp: 'Just now',
        },
      ]);
      speakText(fallbackText);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2 -> Step 3: End Call
  const handleEndCall = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsAiSpeaking(false);
    setIsListening(false);

    trackDemoEvent('ai_demo_completed', {
      business_type: selectedTrade,
      business_name: businessName,
      conversation_duration_seconds: callDurationSeconds,
      message_count: messages.length,
      detected_intent: detectedIntent,
      lead_captured: Boolean(extractedInfo.name || extractedInfo.phone || leadId),
    });

    setCurrentStep('RESULT');
  };

  // Step 3: Handle CTA Click
  const handleStartSignup = (ctaLabel: string) => {
    trackDemoEvent('cta_clicked', {
      cta_label: ctaLabel,
      business_type: selectedTrade,
      business_name: businessName,
      target_url: '/signup',
    });

    trackDemoEvent('signup_started', {
      source: 'receptionist_demo',
      business_type: selectedTrade,
    });

    router.push(`/signup?source=receptionist_demo&trade=${encodeURIComponent(selectedTrade)}&biz=${encodeURIComponent(businessName)}`);
  };

  // Reset to Step 1
  const handleResetDemo = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentStep('SETUP');
    setMessages([]);
    setCallDurationSeconds(0);
    setExtractedInfo({});
    setSuggestedSlots([]);
    setLeadId(undefined);
  };

  // Format timer MM:SS
  const formattedDuration = useMemo(() => {
    const mins = Math.floor(callDurationSeconds / 60);
    const secs = callDurationSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [callDurationSeconds]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* ============================================================ */}
      {/* STEP 1: BUSINESS SETUP */}
      {/* ============================================================ */}
      {currentStep === 'SETUP' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header Card */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Interactive Voice AI Test • Zero Account Required</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Test Your Business{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
                AI Receptionist
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Select your service trade and experience how Ventrexs answers your phone calls, answers customer questions, qualifies leads, and schedules appointments 24/7.
            </p>
          </div>

          {/* Setup Form Glass Card */}
          <div className="bg-[#0A1020]/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="space-y-8">
              {/* Field 1: Business Type Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Step 1: Select Your Business Trade
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(Object.keys(TRADE_PRESETS) as BusinessTradeType[]).map((trade) => {
                    const preset = TRADE_PRESETS[trade];
                    const Icon = TRADE_ICONS[trade];
                    const isSelected = selectedTrade === trade;

                    return (
                      <button
                        key={trade}
                        type="button"
                        onClick={() => handleTradeSelect(trade)}
                        className={`flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-b from-blue-600/25 to-indigo-900/30 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.35)] scale-[1.02]'
                            : 'bg-[#0D1528] border-slate-800/90 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-[#101b33]'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                            isSelected
                              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/40'
                              : 'bg-slate-800/80 text-slate-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {preset.label}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {preset.tagline.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 2 & 3: Business Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Business Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder={activePreset.defaultBusinessName}
                      className="w-full px-4 py-3.5 bg-[#050812] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    The AI will introduce itself as the receptionist for this company name.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Business Phone Number <span className="text-slate-500 lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      placeholder="(555) 234-5678"
                      className="w-full px-4 py-3.5 bg-[#050812] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Used to simulate realistic caller ID and SMS dispatch confirmations.
                  </p>
                </div>
              </div>

              {/* Trade Capabilities Preview Strip */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#070D1C] border border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {activePreset.label} Receptionist Knowledge Base Active
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                        {activePreset.services.length} Services Ready
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Equipped with {activePreset.services.map((s) => s.name.split(' ')[0]).join(', ')} knowledge, emergency triage heuristics, and real booking slot generation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Primary Launch CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No payment required • Safe sandbox simulation • 100% Free</span>
                </div>

                <button
                  type="button"
                  onClick={handleStartDemo}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold text-sm sm:text-base shadow-xl shadow-blue-600/30 hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer border border-blue-400/30"
                >
                  <PhoneCall className="w-5 h-5" />
                  <span>Test My AI Receptionist</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: VOICE AI DEMO (CALL IN PROGRESS) */}
      {/* ============================================================ */}
      {currentStep === 'CALL' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Call Session HUD Header */}
          <div className="bg-[#0A1020]/95 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0A1020] animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {businessName || activePreset.defaultBusinessName}
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-medium">
                    {selectedTrade}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
                    <Radio className="w-3.5 h-3.5 animate-pulse" /> Connected • HD Voice
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-300">{formattedDuration}</span>
                </div>
              </div>
            </div>

            {/* Top Call Action Controls */}
            <div className="flex items-center gap-2.5">
              {/* Mute Audio Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (!isAudioMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    setIsAiSpeaking(false);
                  }
                  setIsAudioMuted(!isAudioMuted);
                }}
                className={`p-2.5 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  isAudioMuted
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title={isAudioMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                <span className="hidden sm:inline">{isAudioMuted ? 'Muted' : 'Audio On'}</span>
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="px-4 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-rose-400/30"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Voice Visualizer & Main Interaction Canvas */}
          <div className="bg-[#0A1020]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Visualizer Container */}
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-6">
              {/* Animated Sound Wave Frequency Bars */}
              <div className="relative flex items-center justify-center gap-1.5 h-20 w-full max-w-md">
                {[40, 65, 85, 95, 70, 50, 90, 100, 75, 45, 80, 60, 95, 70, 40].map((height, i) => {
                  const isActive = isAiSpeaking || isListening || isProcessing;
                  const dynamicHeight = isActive
                    ? Math.max(16, (height * (isAiSpeaking ? 1 : 0.7)) + Math.sin(i + callDurationSeconds) * 15)
                    : 12;

                  return (
                    <div
                      key={i}
                      style={{ height: `${dynamicHeight}%` }}
                      className={`w-1.5 rounded-full transition-all duration-150 ${
                        isAiSpeaking
                          ? 'bg-gradient-to-t from-cyan-500 via-blue-500 to-indigo-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                          : isListening
                          ? 'bg-gradient-to-t from-emerald-500 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                          : isProcessing
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-slate-700/60'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Status State Badge */}
              <div className="flex items-center gap-2">
                {isAiSpeaking && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold animate-pulse">
                    <Volume2 className="w-3.5 h-3.5" /> AI Receptionist Speaking...
                  </span>
                )}
                {isListening && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-pulse">
                    <Mic className="w-3.5 h-3.5" /> Listening to you... Speak now
                  </span>
                )}
                {isProcessing && !isAiSpeaking && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" /> AI Processing Response...
                  </span>
                )}
                {!isAiSpeaking && !isListening && !isProcessing && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                    <Phone className="w-3.5 h-3.5" /> Line Open • Tap mic or pick a prompt
                  </span>
                )}
              </div>

              {/* Big Talk / Microphone Action Button */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={toggleMicrophone}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-90 cursor-pointer ${
                    isListening
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white ring-8 ring-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.6)] animate-pulse'
                      : 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white ring-4 ring-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.4)]'
                  }`}
                  aria-label="Toggle Microphone Speech Input"
                >
                  {isListening ? <Mic className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
                </button>
                <span className="text-xs font-mono text-slate-300 font-medium">
                  {isListening ? 'Tap to Stop Listening' : 'Tap to Speak with AI'}
                </span>
              </div>
            </div>

            {/* Quick 1-Click Caller Prompts Tailored to Trade */}
            <div className="border-t border-slate-800/80 pt-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Or click a realistic caller scenario:</span>
                <span className="text-blue-400 text-[11px]">{activePreset.label} Scenarios</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePreset.quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSendCustomerMessage(p.text)}
                    className="p-2.5 rounded-xl bg-[#0D1528] hover:bg-[#121c35] border border-slate-800 hover:border-blue-500/50 text-left transition-all text-xs flex items-center justify-between gap-2 group cursor-pointer disabled:opacity-50"
                  >
                    <div className="truncate">
                      <span className="text-white font-semibold block group-hover:text-blue-300 transition-colors truncate">
                        "{p.text}"
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.category}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick text input fallback */}
            <div className="border-t border-slate-800/80 pt-4 mt-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCustomerMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type what a customer might say (e.g. My AC stopped cooling...)"
                  className="flex-1 px-4 py-2.5 bg-[#050812] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isProcessing}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Live Call Transcript Accordion */}
          <div className="bg-[#0A1020]/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-3">
            <button
              type="button"
              onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
              className="w-full flex items-center justify-between text-xs font-mono font-semibold text-slate-300 hover:text-white cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Live Audio Transcript ({messages.length} turns)</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isTranscriptOpen ? 'rotate-180 text-blue-400' : 'text-slate-500'
                }`}
              />
            </button>

            {isTranscriptOpen && (
              <div
                ref={chatScrollRef}
                className="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800"
              >
                {messages.map((turn) => {
                  const isAi = turn.sender === 'AI';
                  return (
                    <div
                      key={turn.id}
                      className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAi && (
                        <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                          isAi
                            ? 'bg-[#0D1528] text-slate-200 border border-slate-800/90'
                            : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        }`}
                      >
                        <p>{turn.text}</p>
                        <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] opacity-70">
                          <span>{isAi ? 'AI Receptionist' : 'Customer'}</span>
                          {turn.detectedIntent && (
                            <span className="font-mono text-cyan-300">[{turn.detectedIntent}]</span>
                          )}
                        </div>
                      </div>
                      {!isAi && (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3: DEMO RESULT & CONVERSION SUMMARY */}
      {/* ============================================================ */}
      {currentStep === 'RESULT' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Result Banner */}
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-[#0A1020] border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Call Handled Successfully • {formattedDuration} Duration</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Your AI Receptionist just handled the conversation.
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  The caller was greeted immediately, their issue was diagnosed, and the lead data was structured for your dispatch board.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Result Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Lead Captured */}
            <div className="bg-[#0A1020]/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                  1. Lead Captured
                </span>
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-white block truncate">
                  {extractedInfo.name || 'Identified Customer'}
                </span>
                <span className="text-xs text-slate-400 block font-mono">
                  {extractedInfo.phone || businessPhone || 'Direct Phone Logged'}
                </span>
                {extractedInfo.address && (
                  <span className="text-[11px] text-cyan-400 block truncate font-mono">
                    {extractedInfo.address}
                  </span>
                )}
              </div>
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                extractedInfo.urgency === 'urgent'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                Priority: {extractedInfo.urgency === 'urgent' ? 'High / Emergency' : 'Standard Dispatch'}
              </span>
            </div>

            {/* Card 2: Service Identified */}
            <div className="bg-[#0A1020]/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                  2. Service Identified
                </span>
                <Wrench className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-white block line-clamp-2">
                  {extractedInfo.serviceRequested || activePreset.services[0].name}
                </span>
                <span className="text-xs text-slate-400 block font-mono">
                  Trade: {selectedTrade}
                </span>
              </div>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-medium">
                Catalog Matched
              </span>
            </div>

            {/* Card 3: Customer Intent */}
            <div className="bg-[#0A1020]/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                  3. Customer Intent
                </span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-white block">
                  {detectedIntent.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400 block font-mono">
                  Confidence: {Math.round(confidence * 100)}%
                </span>
              </div>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-medium">
                State: {conversationState}
              </span>
            </div>

            {/* Card 4: Appointment Opportunity */}
            <div className="bg-[#0A1020]/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                  4. Booking Opportunity
                </span>
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-white block">
                  {suggestedSlots.length > 0 ? `${suggestedSlots.length} Slots Generated` : 'Priority Callback'}
                </span>
                <span className="text-xs text-slate-400 block font-mono">
                  {handoffRequired ? 'On-Call Alert Dispatched' : 'Zero Overbooking'}
                </span>
              </div>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                Ready for Dispatch
              </span>
            </div>
          </div>

          {/* Value Prop Conversion Strip */}
          <div className="bg-[#0A1020]/95 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>24/7 Zero Missed Calls • US Service Businesses</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Imagine this answering your customer calls when your team is busy or after hours.
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
                Never lose a $1,500 emergency job or replacement estimate to voicemail again. Ventrexs connects your AI receptionist with CRM, dispatch, invoicing, and reputation.
              </p>
            </div>

            {/* Key Value Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left text-xs">
              <div className="p-3 bg-[#0D1528] rounded-xl border border-slate-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">Zero Missed Opportunities</span>
              </div>
              <div className="p-3 bg-[#0D1528] rounded-xl border border-slate-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-slate-300">Automatic Lead Extraction</span>
              </div>
              <div className="p-3 bg-[#0D1528] rounded-xl border border-slate-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300">Real Schedule Protection</span>
              </div>
            </div>

            {/* Primary Signup & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => handleStartSignup('Start Using Ventrexs')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold text-base shadow-xl shadow-blue-600/30 hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer border border-blue-400/30"
              >
                <span>Start Using Ventrexs</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleResetDemo}
                className="w-full sm:w-auto px-6 py-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Another Business</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
