'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  Bot,
  User,
  Send,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Building2,
  Calendar,
  Wrench,
  Clock,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface SimulatedMessage {
  id: string;
  sender: 'CUSTOMER' | 'AI' | 'SYSTEM';
  text: string;
  timestamp: string;
}

const QUICK_TEST_PROMPTS = [
  'Hi, our second floor AC stopped blowing cold air this morning.',
  'How much is your standard boiler diagnostic fee?',
  'I need to speak to a real person right away.',
  'EMERGENCY: We have a severe water pipe burst in our basement!',
  'I would like to book a heat pump assessment for Friday afternoon.'
];

function TestSimulatorContent() {
  const {
    receptionistSettings,
    receptionistServices,
    sendReceptionistMessage,
    appointments,
  } = useApp();

  const [conversationId, setConversationId] = useState<string>(() => 'test-conv-' + Date.now());
  const [messages, setMessages] = useState<SimulatedMessage[]>([
    {
      id: 'welcome-1',
      sender: 'AI',
      text: receptionistSettings.greeting || 'Hi! Thanks for contacting us. How can our team help with your property today?',
      timestamp: 'Just now',
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Live Diagnostic State
  const [currentState, setCurrentState] = useState<string>('NEW');
  const [detectedIntent, setDetectedIntent] = useState<string>('GENERAL_QUESTION');
  const [confidenceScore, setConfidenceScore] = useState<number>(0.95);
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);
  const [handoffRequired, setHandoffRequired] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    // Append customer message
    const userMsg: SimulatedMessage = {
      id: 'user-' + Date.now(),
      sender: 'CUSTOMER',
      text,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Call Receptionist Engine via AppContext
    const response = await sendReceptionistMessage({
      conversationId,
      message: text,
      channel: 'SIMULATED',
    });

    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: SimulatedMessage = {
        id: 'ai-' + Date.now(),
        sender: 'AI',
        text: response.replyText,
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, aiMsg]);
      setCurrentState(response.state);
      if (response.detectedIntent) setDetectedIntent(response.detectedIntent);
      setHandoffRequired(response.handoffRequired);
      if (response.suggestedSlots) setSuggestedSlots(response.suggestedSlots);
      if (response.leadId) setCreatedLeadId(response.leadId);
    }, 450);
  };

  const handleResetChat = () => {
    const newId = 'test-conv-' + Date.now();
    setConversationId(newId);
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'AI',
        text: receptionistSettings.greeting || 'Hi! Thanks for contacting us. How can our team help today?',
        timestamp: 'Just now',
      }
    ]);
    setCurrentState('NEW');
    setDetectedIntent('GENERAL_QUESTION');
    setConfidenceScore(0.95);
    setExtractedData({});
    setSuggestedSlots([]);
    setHandoffRequired(false);
    setCreatedLeadId(null);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        <PageHeader
          title="AI Receptionist Interactive Simulator"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'AI Receptionist', href: '/receptionist' },
            { label: 'Live Test Simulator' }
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleResetChat} className="gap-1.5">
                <RotateCcw className="w-4 h-4" />
                <span>Reset Chat</span>
              </Button>
              <Link href="/settings/receptionist">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Sliders className="w-4 h-4 text-outline" />
                  <span>Configure Rules</span>
                </Button>
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Center: Interactive Web Chat Simulator (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex flex-col h-[650px]">
            {/* Simulator Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-on-surface">Customer Web Chat Widget</h3>
                  <p className="text-[10px] text-outline">Simulating live incoming customer web inquiry</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">
                Simulated Sandbox
              </span>
            </div>

            {/* Chat Transcript Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 text-xs ${
                    msg.sender === 'CUSTOMER' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'AI' && (
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl max-w-[80%] space-y-1 ${
                      msg.sender === 'CUSTOMER'
                        ? 'bg-primary text-on-primary rounded-tr-xs'
                        : 'bg-surface-container border border-outline-variant/60 text-on-surface rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <span className={`text-[9px] block text-right ${
                      msg.sender === 'CUSTOMER' ? 'text-on-primary/70' : 'text-outline'
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.sender === 'CUSTOMER' && (
                    <div className="w-7 h-7 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-outline italic py-2 pl-9">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span>AI Receptionist is composing reply...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Test Starter Prompts */}
            <div className="py-2 border-t border-outline-variant/30 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-[10px] font-bold text-outline uppercase shrink-0">Try:</span>
              {QUICK_TEST_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant whitespace-nowrap text-[11px] transition-colors border border-outline-variant/40 shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Message Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 pt-2 border-t border-outline-variant/40 shrink-0"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type customer message or inquiry..."
                className="flex-1 bg-surface-container border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              <Button type="submit" size="sm" disabled={!inputMessage.trim() || isTyping} className="gap-1">
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>

          {/* Right Column: Live AI Diagnostic & CRM Action Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Real-time State & Intent Monitor */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Live AI Engine Diagnostics
                </h3>
                <span className="text-[10px] font-bold text-outline">Real-time</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/60">
                  <span className="text-[10px] text-outline uppercase font-bold block">Conversation State</span>
                  <span className="font-extrabold text-primary text-xs mt-0.5 block">{currentState}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/60">
                  <span className="text-[10px] text-outline uppercase font-bold block">Detected Intent</span>
                  <span className="font-extrabold text-on-surface text-xs mt-0.5 block">{detectedIntent}</span>
                </div>
              </div>

              {handoffRequired && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Human Handoff Active</span>
                  </div>
                  <p className="text-[11px]">Conversation escalated to human on-call dispatch.</p>
                </div>
              )}
            </div>

            {/* Booking Slot Proposals */}
            {suggestedSlots.length > 0 && (
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-2 text-xs">
                <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Proposed Time Windows
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {suggestedSlots.map((slot, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CRM Ingestion Status */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-2.5 text-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> CRM Action & Synchronization
              </h3>

              {createdLeadId ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Lead Created & Scored!</span>
                  </div>
                  <p className="text-[11px]">
                    Inbound prospect captured and placed into CRM Leads with automatic quality scoring.
                  </p>
                  <Link href={`/leads?leadId=${createdLeadId}`} className="text-emerald-800 font-bold hover:underline block pt-1">
                    Open in CRM Console &rarr;
                  </Link>
                </div>
              ) : (
                <p className="text-outline text-xs">
                  Provide customer name & contact details in chat to trigger automated lead ingestion.
                </p>
              )}
            </div>

            {/* Defensive Guardrails Verification */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-on-surface">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Active Safety & Financial Boundaries</span>
              </div>
              <ul className="space-y-1 text-[11px] text-on-surface-variant">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Prompt injection & instruction override defense</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Financial ledger & invoice balance immutable</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Multi-tenant data isolation strictly enforced</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ReceptionistTestPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-outline">Loading Simulator...</div>}>
      <TestSimulatorContent />
    </Suspense>
  );
}
