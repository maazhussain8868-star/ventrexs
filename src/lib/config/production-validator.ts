/**
 * VENTREXS AI — PRODUCTION ENVIRONMENT VALIDATOR & DIAGNOSTICS ENGINE
 * Audits all production environment variables, service configurations, secret isolation,
 * and hostname bindings with ZERO secret value leakage.
 */

export interface ServiceConfigReport {
  service: string;
  category: 'INFRASTRUCTURE' | 'PAYMENT' | 'COMMUNICATION' | 'AI' | 'SECURITY';
  status: 'CONFIGURED' | 'NOT_CONFIGURED' | 'UNSUPPORTED' | 'OPTIONAL_MISSING';
  requiredVariables: string[];
  missingVariables: string[];
  isServerOnly: boolean;
  notes: string;
}

export interface ProductionAuditSummary {
  timestamp: string;
  isProductionReady: boolean;
  demoMode: boolean;
  securityChecksPassed: boolean;
  services: Record<string, ServiceConfigReport>;
  secretLeaksDetected: string[];
  recommendations: string[];
}

export class ProductionEnvironmentValidator {
  /**
   * Scans process.env for any server secrets mistakenly prefixed with NEXT_PUBLIC_
   */
  static checkSecretIsolation(): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    const forbiddenPublicKeywords = [
      'SECRET',
      'SERVICE_ROLE',
      'PRIVATE_KEY',
      'AUTH_TOKEN',
      'PASSWORD',
      'WEBHOOK_SECRET',
      'API_SECRET',
    ];

    if (typeof process !== 'undefined' && process.env) {
      for (const key of Object.keys(process.env)) {
        if (key.startsWith('NEXT_PUBLIC_')) {
          const upper = key.toUpperCase();
          for (const kw of forbiddenPublicKeywords) {
            if (upper.includes(kw)) {
              violations.push(`Forbidden secret keyword "${kw}" found in public variable "${key}"`);
            }
          }
        }
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Audits Supabase production infrastructure
   */
  static auditSupabase(): ServiceConfigReport {
    const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
    const missing: string[] = [];

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');

    const isConfigured = missing.length === 0;
    return {
      service: 'Supabase Database & Auth (RLS Enforced)',
      category: 'INFRASTRUCTURE',
      status: isConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
      requiredVariables: [...required, 'SUPABASE_SERVICE_ROLE_KEY'],
      missingVariables: missing,
      isServerOnly: false,
      notes: isConfigured
        ? 'Supabase multi-tenant PostgreSQL and RLS auth active.'
        : `Missing credentials: ${missing.join(', ')}`,
    };
  }

  /**
   * Audits Platform Administrators & Dual-Approval
   */
  static auditPlatformAdmin(): ServiceConfigReport {
    const required = ['PLATFORM_ADMIN_1_EMAIL', 'PLATFORM_ADMIN_2_EMAIL'];
    const missing = required.filter((v) => !process.env[v]);

    const isConfigured = missing.length === 0;
    return {
      service: 'Platform Superadmin Dual-Approval Gate',
      category: 'SECURITY',
      status: isConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
      requiredVariables: required,
      missingVariables: missing,
      isServerOnly: true,
      notes: isConfigured
        ? 'Two distinct platform owner identities configured.'
        : `Missing admin owner identities: ${missing.join(', ')}`,
    };
  }

  /**
   * Audits AI Providers (OpenAI, Gemini, Anthropic)
   */
  static auditAiProviders(): ServiceConfigReport {
    const missing: string[] = [];
    if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) missing.push('GEMINI_API_KEY');
    if (!process.env.ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');

    const hasAtLeastOne = missing.length < 3;
    return {
      service: 'Ethical AI Inference Engine (Gemini / OpenAI / Anthropic)',
      category: 'AI',
      status: hasAtLeastOne ? 'CONFIGURED' : 'NOT_CONFIGURED',
      requiredVariables: ['OPENAI_API_KEY', 'GEMINI_API_KEY', 'ANTHROPIC_API_KEY'],
      missingVariables: missing,
      isServerOnly: true,
      notes: hasAtLeastOne
        ? 'AI models available with automated provider fallback and token-budget guards.'
        : 'No AI API keys configured. AI Receptionist will run in mock simulation.',
    };
  }

  /**
   * Audits Communications Providers (Twilio, WhatsApp, Resend)
   */
  static auditCommunications(): ServiceConfigReport {
    const missing: string[] = [];
    if (!process.env.TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
    if (!process.env.TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
    if (!process.env.WHATSAPP_ACCESS_TOKEN) missing.push('WHATSAPP_ACCESS_TOKEN');
    if (!process.env.RESEND_API_KEY) missing.push('RESEND_API_KEY');

    const isConfigured = missing.length === 0;
    return {
      service: 'Communications Engine (SMS, WhatsApp, Email)',
      category: 'COMMUNICATION',
      status: isConfigured ? 'CONFIGURED' : missing.length < 4 ? 'CONFIGURED' : 'NOT_CONFIGURED',
      requiredVariables: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'WHATSAPP_ACCESS_TOKEN', 'RESEND_API_KEY'],
      missingVariables: missing,
      isServerOnly: true,
      notes: isConfigured
        ? 'Full omni-channel dispatch gateways active.'
        : `Optional communications providers missing: ${missing.join(', ')}`,
    };
  }

  /**
   * Runs complete system audit
   */
  static runFullAudit(): ProductionAuditSummary {
    const isolation = this.checkSecretIsolation();
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    const isTestMode = process.env.VENTREXS_TEST_MODE === 'true';

    const supabaseReport = this.auditSupabase();
    const adminReport = this.auditPlatformAdmin();
    const aiReport = this.auditAiProviders();
    const commsReport = this.auditCommunications();

    const services: Record<string, ServiceConfigReport> = {
      supabase: supabaseReport,
      admin: adminReport,
      ai: aiReport,
      communications: commsReport,
    };

    const isProductionReady =
      isolation.passed &&
      supabaseReport.status === 'CONFIGURED' &&
      adminReport.status === 'CONFIGURED' &&
      !isDemoMode &&
      !isTestMode;

    const recommendations: string[] = [];
    if (isDemoMode) {
      recommendations.push('For real production deployments, set NEXT_PUBLIC_DEMO_MODE=false in your environment.');
    }
    if (isTestMode) {
      recommendations.push('VENTREXS_TEST_MODE must be unset or false in production.');
    }
    if (!isolation.passed) {
      recommendations.push('CRITICAL: Remove server secret keywords from NEXT_PUBLIC_* variables.');
    }

    return {
      timestamp: new Date().toISOString(),
      isProductionReady,
      demoMode: isDemoMode,
      securityChecksPassed: isolation.passed,
      services,
      secretLeaksDetected: isolation.violations,
      recommendations,
    };
  }
}
