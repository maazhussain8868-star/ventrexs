import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import {
  FileCode,
  ShieldCheck,
  Copyright,
  Mail,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { BRAND } from '@/config/brand';

export const metadata: Metadata = {
  title: `Intellectual Property & DMCA Policy | ${BRAND.name}`,
  description:
    `Intellectual Property, Customer Data Ownership, and DMCA Copyright Takedown Policy for ${BRAND.name}.`,
};

export default function IntellectualPropertyPolicyPage() {
  return (
    <LegalLayout
      title="Intellectual Property & DMCA Policy"
      subtitle={`Details regarding ${BRAND.name} platform ownership, customer data sovereignty, trademark guidelines, and our DMCA copyright infringement notice procedure.`}
      lastUpdated="August 24, 2026"
      effectiveDate="August 24, 2026"
      version="v2.4"
      category="Intellectual Property & Rights"
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Copyright className="w-5 h-5 text-blue-400" />
            1. Platform Ownership & Proprietary Rights
          </h2>
          <p>
            The <strong>{BRAND.name}</strong> platform, including all user interfaces, visual design systems, software algorithms, copilot orchestration workflows, source code, database architectures, graphics, and documentation, is the exclusive intellectual property of <strong>{BRAND.legalName}</strong> and its licensors, protected by United States and international copyright, trademark, and intellectual property laws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            2. Customer Data Sovereignty & Ownership
          </h2>
          <p>
            <strong>You retain 100% sole and exclusive ownership of all business records, invoices, customer directories, payment histories, and branding assets uploaded to {BRAND.name}.</strong>
          </p>
          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 text-xs text-slate-300 space-y-2">
            <p><strong>• Limited License:</strong> You grant {BRAND.legalName} a limited, non-exclusive, revocable license strictly necessary to host, process, and transmit your data to deliver the invoicing and collection services.</p>
            <p><strong>• No Commercial Exploitation:</strong> {BRAND.legalName} does not claim any ownership rights over your customer lists or invoices, and will never sell or monetize your proprietary business information.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            3. Trademark Guidelines
          </h2>
          <p>
            &quot;{BRAND.shortName}&quot;, &quot;{BRAND.name}&quot;, and the {BRAND.name} logo are trademarks of {BRAND.legalName}. You may not use our trademarks, brand assets, or logos in advertising or promotional materials without our prior written consent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            4. DMCA Copyright Infringement & Takedown Procedure
          </h2>
          <p>
            If you believe that material residing on or accessible through our platform infringes your copyright, please submit a formal Digital Millennium Copyright Act (DMCA) notice to our Designated Copyright Agent containing:
          </p>
          <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside">
            <li>Physical or electronic signature of the copyright owner or authorized representative.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Specific identification of the infringing material with sufficient detail for us to locate it.</li>
            <li>Your contact information (name, physical address, telephone number, and email address).</li>
            <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner.</li>
            <li>A statement made under penalty of perjury that the information in the notification is accurate.</li>
          </ol>

          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 text-xs font-mono space-y-1 text-slate-300 mt-3">
            <p><strong>Designated DMCA Agent:</strong> Legal Counsel, {BRAND.legalName}</p>
            <p>Email: <a href={`mailto:${BRAND.legalEmail}`} className="text-blue-400 hover:underline">{BRAND.legalEmail}</a></p>
            <p>Address: Corporation Trust Center, 1209 Orange St, Wilmington, DE 19801, USA</p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
