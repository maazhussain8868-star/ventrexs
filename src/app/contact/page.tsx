'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/config/brand';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate inquiry submission
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col">
      {/* Public Navigation Bar */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-on-surface">
            <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold">
              V
            </div>
            <span>Ventrexs <span className="text-primary">AI</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-on-surface-variant">
            <Link href="/features" className="hover:text-on-surface transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-on-surface transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-on-surface transition-colors">About</Link>
            <Link href="/security" className="hover:text-on-surface transition-colors">Security</Link>
            <Link href="/contact" className="text-primary font-bold">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-bold text-on-surface hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link
              href="/demo"
              className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> View Live Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-on-surface">
            Get in Touch with <span className="text-primary">Ventrexs AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Have questions about enterprise deployment, agency licensing, or custom workflow integrations? Our team is standing by.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-on-surface">Enterprise & Advisory Inquiries</h2>
              <p className="text-xs text-on-surface-variant">
                Direct channels for commercial support, partnership inquiries, and dual-approved demo invitations.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="block font-bold text-on-surface">Email Support & Sales</span>
                  <span className="text-on-surface-variant font-mono">{BRAND.supportEmail}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="block font-bold text-on-surface">Response SLA</span>
                  <span className="text-on-surface-variant">Within 2 hours (Mon–Fri, 8am–8pm EST)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <span className="block font-bold text-on-surface">Security & Compliance Hotline</span>
                  <span className="text-on-surface-variant font-mono">{BRAND.securityEmail}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Sparkles className="w-3.5 h-3.5" /> Looking for an Instant Walkthrough?
              </div>
              <p className="text-[11px] text-on-surface-variant">
                You can access our interactive sandbox directly through our secure dual-approval demo gate.
              </p>
              <Link
                href="/demo"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
              >
                Access Live Demo Environment &rarr;
              </Link>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-md">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-on-surface">Message Received!</h3>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                  Thank you for reaching out. A Ventrexs AI specialist will get back to you shortly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-base font-bold text-on-surface">Send Us a Message</h2>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jordan Davis"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@apex-services.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface">Company / Business Name</label>
                  <input
                    type="text"
                    placeholder="Apex Heating & Plumbing"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface">How can we help?</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your trade operations and team size..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full text-xs font-bold"
                  isLoading={loading}
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/20 py-8 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div>&copy; {new Date().getFullYear()} {BRAND.legalName}. All rights reserved. {BRAND.attribution} • {BRAND.name}.</div>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/privacy" className="hover:text-on-surface">Privacy</Link>
            <Link href="/terms" className="hover:text-on-surface">Terms</Link>
            <Link href="/security" className="hover:text-on-surface">Security</Link>
            <Link href="/contact" className="hover:text-on-surface">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
