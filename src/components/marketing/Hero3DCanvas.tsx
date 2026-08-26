'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  FileText,
  CreditCard,
  Users,
  ShieldAlert,
  Sparkles,
  Mail,
  MessageSquare,
  PhoneCall,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';

interface FloatingModule {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  glowColor: string;
  orbitIndex: number; // 1: Operations, 2: Comms, 3: Intelligence
  orbitRadiusX: number; // in pixels
  orbitRadiusY: number;
  initialAngle: number;
  statusBadge: string;
  plane: 'foreground' | 'midground' | 'background';
  zDepth: number; // Actual Z translation in px
  scale: number;
  workflowStage: number; // 1 to 6 for scroll transformation target
}

const MODULES: FloatingModule[] = [
  // FOREGROUND PLANE (Z > 120px, Scale > 1.10, overlaps core & other layers)
  {
    id: 'copilot',
    name: 'AI Copilot',
    category: 'Advisory Engine',
    icon: Sparkles,
    accentColor: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.65)',
    orbitIndex: 3,
    orbitRadiusX: 290,
    orbitRadiusY: 150,
    initialAngle: Math.PI * 0.9,
    statusBadge: 'Bounds-Checked',
    plane: 'foreground',
    zDepth: 180, // High foreground
    scale: 1.18,
    workflowStage: 5,
  },
  {
    id: 'invoice',
    name: 'Smart Invoicing',
    category: 'Zero-Interest Ledger',
    icon: FileText,
    accentColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.65)',
    orbitIndex: 1,
    orbitRadiusX: 270,
    orbitRadiusY: 140,
    initialAngle: -0.2,
    statusBadge: 'Halal-First',
    plane: 'foreground',
    zDepth: 155, // High foreground
    scale: 1.15,
    workflowStage: 1,
  },
  {
    id: 'sms',
    name: 'SMS Reminders',
    category: 'TCPA Affirmative Opt-In',
    icon: MessageSquare,
    accentColor: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.6)',
    orbitIndex: 2,
    orbitRadiusX: 280,
    orbitRadiusY: 145,
    initialAngle: Math.PI * 1.25,
    statusBadge: 'STOP Guard',
    plane: 'foreground',
    zDepth: 140, // Foreground
    scale: 1.10,
    workflowStage: 5,
  },

  // MIDGROUND PLANE (Z between -10px and 45px)
  {
    id: 'payment',
    name: 'Payment Tracking',
    category: 'Stripe HMAC Verified',
    icon: CreditCard,
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    orbitIndex: 1,
    orbitRadiusX: 350,
    orbitRadiusY: 175,
    initialAngle: 0.8,
    statusBadge: 'Idempotent',
    plane: 'midground',
    zDepth: 25,
    scale: 0.98,
    workflowStage: 2,
  },
  {
    id: 'email',
    name: 'Email Dispatch',
    category: 'Transactional Resend',
    icon: Mail,
    accentColor: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    orbitIndex: 2,
    orbitRadiusX: 340,
    orbitRadiusY: 170,
    initialAngle: Math.PI * 1.6,
    statusBadge: 'Multi-Tone',
    plane: 'midground',
    zDepth: 35,
    scale: 0.98,
    workflowStage: 5,
  },
  {
    id: 'analytics',
    name: 'Financial Reports',
    category: 'Velocity & Recovery',
    icon: BarChart3,
    accentColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    orbitIndex: 3,
    orbitRadiusX: 360,
    orbitRadiusY: 180,
    initialAngle: 0.35,
    statusBadge: 'Real-Time',
    plane: 'midground',
    zDepth: 10,
    scale: 0.95,
    workflowStage: 6,
  },

  // BACKGROUND PLANE (Z between -140px and -80px, behind core with depth occlusion)
  {
    id: 'customer',
    name: 'Customer CRM',
    category: 'Tenant-Isolated',
    icon: Users,
    accentColor: '#6366F1',
    glowColor: 'rgba(99, 102, 241, 0.45)',
    orbitIndex: 1,
    orbitRadiusX: 250,
    orbitRadiusY: 125,
    initialAngle: Math.PI * 0.45,
    statusBadge: 'RLS Enforced',
    plane: 'background',
    zDepth: -100, // Behind core
    scale: 0.82,
    workflowStage: 3,
  },
  {
    id: 'collection',
    name: 'Auto Collections',
    category: 'Aging Cadence',
    icon: ShieldAlert,
    accentColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    orbitIndex: 3,
    orbitRadiusX: 370,
    orbitRadiusY: 185,
    initialAngle: Math.PI * 0.7,
    statusBadge: 'Ethical AR',
    plane: 'background',
    zDepth: -125, // Deep background
    scale: 0.78,
    workflowStage: 4,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Engine',
    category: 'Meta Business API',
    icon: PhoneCall,
    accentColor: '#22C55E',
    glowColor: 'rgba(34, 197, 94, 0.45)',
    orbitIndex: 2,
    orbitRadiusX: 380,
    orbitRadiusY: 190,
    initialAngle: Math.PI * 1.85,
    statusBadge: 'Cloud Template',
    plane: 'background',
    zDepth: -95, // Behind core
    scale: 0.84,
    workflowStage: 5,
  },
];

export default function Hero3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    // Scroll parallax & 3D transformation tracker
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // When hero scrolls past top, progress goes from 0 to 1
      const progress = Math.max(0, Math.min(1, -rect.top / (windowHeight * 0.85)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // HTML5 Canvas: 3 Distinct Orbit Paths, Volumetric Core Glow, and Connected Light Pulses
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 660);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Ambient floating data nodes
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.35 + 0.1,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      hue: Math.random() > 0.6 ? 218 : 255,
    }));

    let pulseTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Soft atmospheric volumetric blue glow behind core
      const glowScale = Math.max(0.1, 1 - scrollProgress * 0.8);
      const radialGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        20 * glowScale,
        centerX,
        centerY,
        340 * glowScale
      );
      radialGlow.addColorStop(0, `rgba(37, 99, 235, ${0.22 * glowScale})`);
      radialGlow.addColorStop(0.4, `rgba(30, 58, 138, ${0.1 * glowScale})`);
      radialGlow.addColorStop(0.75, `rgba(99, 102, 241, ${0.04 * glowScale})`);
      radialGlow.addColorStop(1, 'rgba(5, 8, 18, 0)');

      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 340 * glowScale, 0, Math.PI * 2);
      ctx.fill();

      // 2. Three Distinct Orbital Paths with differential rotation & scale
      const orbits = [
        {
          index: 1,
          name: 'Operations',
          rx: 270 * (1 + scrollProgress * 0.4),
          ry: 135 * (1 + scrollProgress * 0.4),
          color: 'rgba(59, 130, 246, 0.18)',
          dash: [4, 8],
          rot: pulseTime * 0.015,
        },
        {
          index: 2,
          name: 'Communication',
          rx: 340 * (1 + scrollProgress * 0.5),
          ry: 170 * (1 + scrollProgress * 0.5),
          color: 'rgba(6, 182, 212, 0.15)',
          dash: [6, 12],
          rot: -pulseTime * 0.01,
        },
        {
          index: 3,
          name: 'Intelligence',
          rx: 400 * (1 + scrollProgress * 0.6),
          ry: 200 * (1 + scrollProgress * 0.6),
          color: 'rgba(139, 92, 246, 0.14)',
          dash: [3, 10],
          rot: pulseTime * 0.008,
        },
      ];

      orbits.forEach((orb) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(orb.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = orb.color;
        ctx.lineWidth = 1.2;
        ctx.setLineDash(orb.dash);
        ctx.stroke();
        ctx.restore();
      });

      // 3. Dynamic Connection Rays & Signal Pulses (Desktop only)
      if (width >= 768) {
        MODULES.forEach((mod, idx) => {
          const angle = mod.initialAngle + pulseTime * (mod.orbitIndex === 2 ? -0.003 : 0.004);
          const targetX = centerX + Math.cos(angle) * mod.orbitRadiusX;
          const targetY = centerY + Math.sin(angle) * mod.orbitRadiusY;
          const isTargeted = activeModule === mod.id;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(targetX, targetY);

          const rayGrad = ctx.createLinearGradient(centerX, centerY, targetX, targetY);
          rayGrad.addColorStop(0, isTargeted ? 'rgba(59, 130, 246, 0.6)' : 'rgba(37, 99, 235, 0.25)');
          rayGrad.addColorStop(0.7, isTargeted ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.06)');
          rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = isTargeted ? 1.8 : 0.9;
          ctx.stroke();

          // Traveling light pulses
          const pulseProgress = (pulseTime * 0.6 + idx * 0.12) % 1;
          const pulseX = centerX + (targetX - centerX) * pulseProgress;
          const pulseY = centerY + (targetY - centerY) * pulseProgress;

          ctx.beginPath();
          ctx.arc(pulseX, pulseY, isTargeted ? 2.5 : 1.5, 0, Math.PI * 2);
          ctx.fillStyle = mod.accentColor;
          ctx.shadowColor = mod.accentColor;
          ctx.shadowBlur = isTargeted ? 12 : 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 4. Background data particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 65%, ${p.alpha * (1 - scrollProgress * 0.5)})`;
        ctx.fill();
      });

      pulseTime += 0.005;

      if (!reducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [reducedMotion, activeModule, scrollProgress]);

  // Smooth mouse parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || reducedMotion) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Scroll transformation factors: Core scales down and recedes backward in Z-space
  const coreZ = 60 - scrollProgress * 280;
  const coreScale = Math.max(0.65, 1 - scrollProgress * 0.35);
  const coreOpacity = Math.max(0.15, 1 - scrollProgress * 1.1);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[580px] sm:h-[640px] lg:h-[700px] flex items-center justify-center overflow-hidden select-none"
      style={{ perspective: '1400px' }}
      aria-label="3D Ventrexs AI Financial Ecosystem & Spatial Architecture"
    >
      {/* Background canvas for 3 orbital tracks, connector rays, and ambient particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full"
      />

      {/* 3D Scene Root Wrapper with Preserve-3D */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
        style={{
          transform: `rotateY(${mousePos.x * 16}deg) rotateX(${-mousePos.y * 14}deg) translateZ(0)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* ============================================================ */}
        {/* 1. CENTRAL VENTREXS AI FINANCIAL CORE (30% LARGER & LAYERED) */}
        {/* ============================================================ */}
        <div
          className="relative z-20 w-[330px] sm:w-[410px] rounded-3xl bg-gradient-to-b from-[#0E172E]/95 via-[#0A1022]/95 to-[#050814]/98 border border-blue-500/50 backdrop-blur-2xl shadow-[0_0_90px_rgba(37,99,235,0.35),0_30px_70px_rgba(0,0,0,0.9)] p-6 sm:p-7 transition-all duration-300 group"
          style={{
            transform: `translate3d(0px, ${scrollProgress * 40}px, ${coreZ}px) scale(${coreScale})`,
            transformStyle: 'preserve-3d',
            opacity: coreOpacity,
          }}
        >
          {/* Top specular cyan light bar */}
          <div className="absolute top-0 left-1/5 right-1/5 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(6,182,212,1)]" />

          {/* Internal Luminous Network Visual (SVG) */}
          <div className="absolute -top-6 -right-6 w-24 h-24 pointer-events-none opacity-40 blur-[1px]">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-blue-400 fill-none">
              <circle cx="50" cy="50" r="30" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="45" strokeWidth="0.75" strokeDasharray="6 6" />
              <line x1="20" y1="20" x2="80" y2="80" strokeWidth="1" />
              <line x1="80" y1="20" x2="20" y2="80" strokeWidth="1" />
            </svg>
          </div>

          {/* Core Header Row */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 shadow-lg shadow-blue-500/40 border border-blue-400/50">
                <Zap className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  Ventrexs <span className="text-blue-400">AI</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Financial Operating Core</span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> 242/242
            </span>
          </div>

          {/* Real-time Ledger Metrics Display */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-left">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-inner">
              <span className="text-[11px] text-slate-400 font-medium block">Active Receivables</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">$48,500.00</span>
              <span className="text-[9px] font-mono text-emerald-400 block mt-0.5">12 Live Invoices</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-inner">
              <span className="text-[11px] text-slate-400 font-medium block">Collected (30d)</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400 tracking-tight">$31,200.00</span>
              <span className="text-[9px] font-mono text-blue-400 block mt-0.5">100% Idempotent</span>
            </div>
          </div>

          {/* Contextual Advisory AI Status Pill */}
          <div className="p-3 rounded-2xl bg-blue-950/50 border border-blue-500/30 flex items-center justify-between text-left gap-2 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="truncate">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  AI Copilot: Batch settlement ready
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">
                  Authoritative Ledger: Zero Interest
                </span>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0 font-semibold">
              Active
            </span>
          </div>

          {/* Core Footer Security Badges */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="text-blue-400 font-medium">RLS Isolated</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-medium">HMAC Webhooks</span>
            <span className="text-slate-600">•</span>
            <span className="text-purple-400 font-medium">Bounds Enforced</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. THREE-DEPTH 3D MODULES (FOREGROUND, MIDGROUND, BACKGROUND) */}
        {/* ============================================================ */}
        {isMounted &&
          MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            const currentAngle = mod.initialAngle;

            // Base 3D orbital coordinates
            const posX = Math.cos(currentAngle) * mod.orbitRadiusX;
            const posY = Math.sin(currentAngle) * mod.orbitRadiusY;
            const posZ = mod.zDepth;
            const isHovered = activeModule === mod.id;

            // Scroll transformation: Modules smoothly expand outward & shift toward workflow layout
            const scrollShiftX = (mod.workflowStage - 3.5) * 60 * scrollProgress;
            const scrollShiftY = scrollProgress * 120;
            const scrollZ = posZ - scrollProgress * 100;

            // Depth styling by plane
            const isForeground = mod.plane === 'foreground';
            const isBackground = mod.plane === 'background';

            return (
              <div
                key={mod.id}
                onMouseEnter={() => setActiveModule(mod.id)}
                onMouseLeave={() => setActiveModule(null)}
                className={`absolute transition-all duration-300 ease-out cursor-pointer ${
                  // On mobile screens (<768px), show foreground & primary modules cleanly
                  idx > 4 ? 'hidden md:flex' : 'flex'
                }`}
                style={{
                  transform: `translate3d(${posX + scrollShiftX}px, ${posY + scrollShiftY}px, ${
                    isHovered ? scrollZ + 40 : scrollZ
                  }px) scale(${isHovered ? mod.scale * 1.08 : mod.scale})`,
                  transformStyle: 'preserve-3d',
                  zIndex: isForeground ? 40 : isBackground ? 10 : 25,
                  opacity: isBackground && !isHovered ? 0.78 : 1,
                }}
              >
                <div
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl backdrop-blur-2xl transition-all duration-200 ${
                    isForeground
                      ? 'bg-[#0E172E]/95 border-2 shadow-[0_20px_45px_rgba(0,0,0,0.85)]'
                      : isBackground
                      ? 'bg-[#070B16]/85 border border-slate-800/80 shadow-[0_10px_25px_rgba(0,0,0,0.6)]'
                      : 'bg-[#0A1122]/90 border border-slate-700/80 shadow-[0_15px_30px_rgba(0,0,0,0.7)]'
                  }`}
                  style={{
                    borderColor: isHovered
                      ? mod.accentColor
                      : isForeground
                      ? `${mod.accentColor}80`
                      : 'rgba(255, 255, 255, 0.12)',
                    boxShadow: isHovered
                      ? `0 0 30px ${mod.glowColor}, 0 20px 45px rgba(0,0,0,0.85)`
                      : undefined,
                  }}
                >
                  <div
                    className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-white shrink-0 shadow-md"
                    style={{
                      backgroundColor: mod.accentColor,
                      boxShadow: `0 0 12px ${mod.glowColor}`,
                    }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-white tracking-tight whitespace-nowrap">
                        {mod.name}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {mod.statusBadge}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Spatial 3D Guide Legend */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#050814]/95 border border-slate-800/90 backdrop-blur-xl text-[10px] text-slate-400 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="font-mono">
          3D Spatial Network • Foreground / Midground / Background Depth Planes
        </span>
      </div>
    </div>
  );
}
