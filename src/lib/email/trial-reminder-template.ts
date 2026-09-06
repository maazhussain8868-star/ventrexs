import { BRAND } from '@/config/brand';

export interface TrialReminderEmailParams {
  recipientName: string;
  businessName: string;
  plan: string;
  trialEndsAt: string;
  pricingUrl?: string;
  reminderType: 'day5' | 'day7';
}

export function renderTrialReminderEmail(params: TrialReminderEmailParams): {
  subject: string;
  text: string;
  html: string;
} {
  const {
    recipientName = 'Valued Partner',
    businessName = 'Your Business',
    plan = 'Professional',
    trialEndsAt,
    pricingUrl = `${BRAND.appDomain}/pricing?plan=${encodeURIComponent(plan)}&from=trial_reminder`,
    reminderType,
  } = params;

  const isDay7 = reminderType === 'day7';

  // Subject lines explicitly required by requirements
  const subject = isDay7
    ? 'Your free trial ends today — subscribe to keep access'
    : 'Your free trial ends in 2 days — subscribe to keep access';

  const timeNotice = isDay7
    ? 'Your 7-day free trial ends today.'
    : 'Your 7-day free trial will conclude in 2 days (48 hours).';

  const urgencyText = isDay7
    ? 'This is your final notice: after today, your live AI Receptionist phone line, customer call dispatching, automated lead follow-ups, and field operations tools will be locked until a plan is activated.'
    : 'To ensure zero interruption to your live AI Receptionist phone line, incoming customer inquiries, estimates, and automated customer follow-ups, please select your subscription plan today.';

  const formattedDate = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Soon';

  // Plaintext version
  const text = `Hi ${recipientName},

${timeNotice}

${urgencyText}

CURRENT WORKSPACE DETAILS:
- Business: ${businessName}
- Selected Plan: ${plan} Plan
- Trial Expiration: ${formattedDate}
- Data Status: Preserved & Ready

Subscribe now to keep full access:
${pricingUrl}

If you have questions or need assistance choosing the right tier, reply directly to this email or visit our help center.

Best regards,
The ${BRAND.name} Team
${BRAND.domain}`;

  // Responsive, modern HTML version
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px 12px; color: #f1f5f9; }
    .container { max-width: 580px; margin: 0 auto; background: #111827; border-radius: 16px; border: 1px solid #1f2937; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px; border-bottom: 1px solid #1f2937; text-align: left; }
    .badge { display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; border-radius: 9999px; ${isDay7 ? 'background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);' : 'background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);'} margin-bottom: 12px; }
    .title { margin: 0; font-size: 22px; font-weight: 800; line-height: 1.3; color: #ffffff; }
    .body { padding: 32px; }
    .greeting { font-size: 16px; font-weight: 600; color: #f8fafc; margin-bottom: 16px; }
    .text { font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
    .info-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06); font-size: 13px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #94a3b8; }
    .info-val { font-weight: 700; color: #f8fafc; text-align: right; }
    .cta-container { text-align: center; margin: 32px 0 16px; }
    .btn { display: inline-block; background: ${isDay7 ? '#ef4444' : '#6366f1'}; color: #ffffff !important; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 14px; font-weight: 800; letter-spacing: 0.02em; box-shadow: 0 4px 14px 0 ${isDay7 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(99, 102, 241, 0.4)'}; }
    .footer { padding: 24px 32px; background: #0b0f19; border-top: 1px solid #1f2937; text-align: center; font-size: 12px; color: #64748b; }
    .footer a { color: #818cf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">${isDay7 ? 'Trial Ending Today' : '2 Days Remaining'}</span>
      <h1 class="title">${subject}</h1>
    </div>

    <div class="body">
      <p class="greeting">Hello ${recipientName},</p>
      <p class="text">
        ${timeNotice} ${urgencyText}
      </p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Workspace</span>
          <span class="info-val">${businessName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Plan Tier</span>
          <span class="info-val">${plan} Plan</span>
        </div>
        <div class="info-row">
          <span class="info-label">Expiration Date</span>
          <span class="info-val">${formattedDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Workspace Data</span>
          <span class="info-val" style="color: #34d399;">100% Preserved</span>
        </div>
      </div>

      <div class="cta-container">
        <a href="${pricingUrl}" class="btn">Subscribe Now & Keep Access</a>
      </div>
      <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 12px;">
        Zero-friction checkout • Instant workspace continuity
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px 0;">
        Need help? Contact our support desk at <a href="mailto:${BRAND.supportEmail}">${BRAND.supportEmail}</a>
      </p>
      <p style="margin: 0; color: #475569;">
        &copy; ${BRAND.copyrightYear} ${BRAND.name}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
}
