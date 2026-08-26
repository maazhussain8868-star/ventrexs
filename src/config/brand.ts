export const BRAND = {
  name: 'Ventrexs AI',
  shortName: 'Ventrexs',
  tagline: 'The AI Operating System for Modern Businesses',
  positioning: 'AI-Powered Business Operations Platform',
  description:
    'Run your service business smarter with AI-powered reception, CRM, jobs, payments, reputation management, and business intelligence.',
  domain: 'https://ventrexs.com',
  rawDomain: 'ventrexs.com',
  appDomain: 'https://ventrexs.com',
  agencyDomain: 'https://agency.ventrexs.com',
  adminDomain: 'https://admin.ventrexs.com',
  demoPath: '/demo',
  companyName: 'Desynthic',
  attribution: 'Powered by Desynthic',
  supportEmail: 'support@ventrexs.com',
  privacyEmail: 'privacy@ventrexs.com',
  billingEmail: 'billing@ventrexs.com',
  securityEmail: 'security@ventrexs.com',
  abuseEmail: 'abuse@ventrexs.com',
  legalEmail: 'legal@ventrexs.com',
  legalName: 'Desynthic',
  copyrightYear: '2026',
  social: {
    twitter: '@ventrexs',
    github: 'ventrexs',
    linkedin: 'ventrexs-ai',
  },
} as const;

export type BrandConfig = typeof BRAND;
