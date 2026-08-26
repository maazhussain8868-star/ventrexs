/**
 * Ventrexs AI — Production Environment Validator
 * Enforces strict environment variable integrity and prevents accidental dev mock usage in production.
 */

export interface EnvValidationResult {
  isValid: boolean;
  environment: 'development' | 'staging' | 'production' | 'test';
  missingVariables: string[];
  warnings: string[];
  errors: string[];
}

export function validateProductionEnvironment(): EnvValidationResult {
  const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase() as
    | 'development'
    | 'staging'
    | 'production'
    | 'test';

  const isProduction = nodeEnv === 'production';
  const missingVariables: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // 1. Core Supabase Infrastructure
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    missingVariables.push('NEXT_PUBLIC_SUPABASE_URL');
  } else if (isProduction && (supabaseUrl.includes('localhost') || supabaseUrl.includes('ventrexs-demo') || supabaseUrl.includes('flowvexa-demo') || supabaseUrl.includes('paypilot-demo'))) {
    errors.push('CRITICAL: NEXT_PUBLIC_SUPABASE_URL cannot point to localhost or demo project in production');
  }

  if (!supabaseAnonKey) {
    missingVariables.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  } else if (isProduction && supabaseAnonKey.includes('demo-anon-key')) {
    errors.push('CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is using mock demo key in production');
  }

  if (!supabaseServiceKey) {
    if (isProduction) {
      errors.push('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is required for server-side operations in production');
    } else {
      warnings.push('SUPABASE_SERVICE_ROLE_KEY is missing (required for admin operations)');
    }
  }

  // 2. Email Provider (Resend in Production)
  const emailProvider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
  if (isProduction) {
    if (emailProvider !== 'resend') {
      errors.push(`CRITICAL: EMAIL_PROVIDER must be configured to "resend" in production (Currently: "${emailProvider || 'empty'}")`);
    }
    if (!process.env.RESEND_API_KEY) {
      missingVariables.push('RESEND_API_KEY');
    }
  }

  // 3. SMS Provider (Twilio in Production)
  const smsProvider = (process.env.SMS_PROVIDER || '').toLowerCase();
  if (isProduction) {
    if (smsProvider !== 'twilio') {
      errors.push(`CRITICAL: SMS_PROVIDER must be configured to "twilio" in production (Currently: "${smsProvider || 'empty'}")`);
    }
    if (!process.env.TWILIO_ACCOUNT_SID) missingVariables.push('TWILIO_ACCOUNT_SID');
    if (!process.env.TWILIO_AUTH_TOKEN) missingVariables.push('TWILIO_AUTH_TOKEN');
    if (!process.env.TWILIO_FROM_NUMBER) missingVariables.push('TWILIO_FROM_NUMBER');
  }

  // 4. WhatsApp Provider (Meta Cloud API in Production)
  const waProvider = (process.env.WHATSAPP_PROVIDER || '').toLowerCase();
  if (isProduction) {
    if (waProvider !== 'meta') {
      errors.push(`CRITICAL: WHATSAPP_PROVIDER must be configured to "meta" in production (Currently: "${waProvider || 'empty'}")`);
    }
    if (!process.env.WHATSAPP_API_TOKEN) missingVariables.push('WHATSAPP_API_TOKEN');
    if (!process.env.WHATSAPP_PHONE_NUMBER_ID) missingVariables.push('WHATSAPP_PHONE_NUMBER_ID');
    if (!process.env.WHATSAPP_BUSINESS_ACCOUNT_ID) missingVariables.push('WHATSAPP_BUSINESS_ACCOUNT_ID');
  }

  // 5. Billing Provider (Stripe in Production)
  const billingProvider = (process.env.BILLING_PROVIDER || '').toLowerCase();
  if (isProduction) {
    if (billingProvider !== 'stripe') {
      errors.push(`CRITICAL: BILLING_PROVIDER must be configured to "stripe" in production (Currently: "${billingProvider || 'empty'}")`);
    }
    if (!process.env.STRIPE_SECRET_KEY) missingVariables.push('STRIPE_SECRET_KEY');
    if (!process.env.STRIPE_WEBHOOK_SECRET) missingVariables.push('STRIPE_WEBHOOK_SECRET');
  }

  // 6. Gemini AI Key
  if (isProduction && !process.env.GEMINI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
    warnings.push('GEMINI_API_KEY is not defined. Local rule-based AI engine will be used as primary copilot.');
  }

  // Final Evaluation
  if (missingVariables.length > 0) {
    errors.push(`Missing required environment variables: ${missingVariables.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    environment: nodeEnv,
    missingVariables,
    warnings,
    errors,
  };
}
