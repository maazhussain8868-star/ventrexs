import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getEmailProvider } from '@/lib/email/providers/factory';
import { renderTrialReminderEmail } from '@/lib/email/trial-reminder-template';
import { BRAND } from '@/config/brand';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s timeout for cron

/**
 * Scheduled Trial Reminders & Overdue Expiration Worker
 * Compatible with Vercel Cron, Supabase Scheduled Functions, and external schedulers.
 *
 * Requirements enforced:
 * 1. Day 5: 2 days remaining (<= 48h) -> Dispatches Day 5 reminder email (idempotent).
 * 2. Day 7: Ending today (<= 24h) -> Dispatches Day 7 final reminder email (idempotent).
 * 3. Overdue (<= 0h) -> Immediately transitions status to 'expired' regardless of usage.
 */
export async function GET(req: NextRequest) {
  return handleTrialReminders(req);
}

export async function POST(req: NextRequest) {
  return handleTrialReminders(req);
}

async function handleTrialReminders(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  const xCronSecret = req.headers.get('x-cron-secret');
  const querySecret = req.nextUrl.searchParams.get('secret');

  const isAuthorized =
    !cronSecret ||
    process.env.NODE_ENV !== 'production' ||
    authHeader === `Bearer ${cronSecret}` ||
    xCronSecret === cronSecret ||
    querySecret === cronSecret;

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
  }

  let adminSupabase;
  try {
    adminSupabase = createAdminClient();
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Database admin client unavailable' },
      { status: 503 }
    );
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const nowMs = now.getTime();

  let processedCount = 0;
  let day5RemindersSent = 0;
  let day7RemindersSent = 0;
  let expiredCount = 0;
  const errors: string[] = [];

  try {
    // 1. Fetch all trialing subscriptions
    const { data: subscriptions, error: fetchErr } = await adminSupabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        business_id,
        plan,
        selected_plan,
        status,
        trial_start,
        trial_ends_at,
        current_period_end,
        trial_day5_reminder_sent_at,
        trial_day7_reminder_sent_at
      `)
      .eq('status', 'trialing');

    if (fetchErr) {
      throw new Error(`Failed to query trialing subscriptions: ${fetchErr.message}`);
    }

    const emailProvider = getEmailProvider();

    for (const sub of (subscriptions || [])) {
      processedCount++;
      const trialEndDateStr = sub.trial_ends_at || sub.current_period_end;
      if (!trialEndDateStr) continue;

      const trialEndMs = new Date(trialEndDateStr).getTime();
      const remainingMs = trialEndMs - nowMs;
      const remainingHours = remainingMs / (1000 * 60 * 60);

      // A. HARD EXPIRED: trial_ends_at has passed (<= 0 ms remaining)
      if (remainingMs <= 0) {
        const { error: expireErr } = await adminSupabase
          .from('subscriptions')
          .update({
            status: 'expired',
            updated_at: nowIso,
          })
          .eq('id', sub.id);

        if (expireErr) {
          errors.push(`Sub ${sub.id} expire error: ${expireErr.message}`);
        } else {
          expiredCount++;
          // Log audit record
          try {
            await adminSupabase.from('audit_logs').insert({
              business_id: sub.business_id,
              user_id: sub.user_id || null,
              action: 'TRIAL_EXPIRED',
              entity: 'subscription',
              entity_id: sub.id,
              metadata: {
                expired_at: nowIso,
                trial_ends_at: trialEndDateStr,
                plan: sub.plan,
                reason: 'Trial period concluded',
              },
            });
          } catch {}
        }
        continue;
      }

      // Resolve recipient email and business details
      let recipientEmail: string | null = null;
      let recipientName: string = 'Valued Partner';
      let businessName: string = 'Your Workspace';

      if (sub.user_id) {
        try {
          const { data: userData } = await adminSupabase.auth.admin.getUserById(sub.user_id);
          recipientEmail = userData.user?.email || null;
          recipientName = userData.user?.user_metadata?.name || recipientEmail?.split('@')[0] || recipientName;
        } catch {}
      }

      if (sub.business_id) {
        const { data: bizData } = await adminSupabase
          .from('businesses')
          .select('name, email')
          .eq('id', sub.business_id)
          .maybeSingle();

        if (bizData) {
          businessName = bizData.name || businessName;
          if (!recipientEmail && bizData.email) {
            recipientEmail = bizData.email;
          }
        }
      }

      if (!recipientEmail) {
        continue; // Skip sending email if no email address found
      }

      const activePlan = sub.selected_plan || sub.plan || 'Starter';
      const pricingUrl = `${BRAND.appDomain}/pricing?plan=${encodeURIComponent(activePlan)}&from=trial_reminder`;

      // B. DAY 7 FINAL REMINDER (trial ending today: <= 24 hours remaining)
      if (remainingHours <= 24 && remainingHours > 0 && !sub.trial_day7_reminder_sent_at) {
        const emailContent = renderTrialReminderEmail({
          recipientName,
          businessName,
          plan: activePlan,
          trialEndsAt: trialEndDateStr,
          pricingUrl,
          reminderType: 'day7',
        });

        const sendResult = await emailProvider.sendEmail({
          to: recipientEmail,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
          headers: {
            'X-Ventrexs-Reminder': 'trial_day7',
            'X-Ventrexs-Subscription-Id': sub.id,
          },
        });

        if (sendResult.success) {
          await adminSupabase
            .from('subscriptions')
            .update({
              trial_day7_reminder_sent_at: nowIso,
              updated_at: nowIso,
            })
            .eq('id', sub.id);

          day7RemindersSent++;

          try {
            await adminSupabase.from('audit_logs').insert({
              business_id: sub.business_id,
              user_id: sub.user_id || null,
              action: 'TRIAL_REMINDER_DAY7_SENT',
              entity: 'subscription',
              entity_id: sub.id,
              metadata: {
                recipient: recipientEmail,
                message_id: sendResult.messageId,
                sent_at: nowIso,
                remaining_hours: Math.round(remainingHours * 10) / 10,
              },
            });
          } catch {}
        } else {
          errors.push(`Failed to send Day 7 email for sub ${sub.id}: ${sendResult.error}`);
        }
      }
      // C. DAY 5 REMINDER (2 days remaining: <= 48 hours remaining, > 24 hours)
      else if (remainingHours <= 48 && remainingHours > 24 && !sub.trial_day5_reminder_sent_at) {
        const emailContent = renderTrialReminderEmail({
          recipientName,
          businessName,
          plan: activePlan,
          trialEndsAt: trialEndDateStr,
          pricingUrl,
          reminderType: 'day5',
        });

        const sendResult = await emailProvider.sendEmail({
          to: recipientEmail,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
          headers: {
            'X-Ventrexs-Reminder': 'trial_day5',
            'X-Ventrexs-Subscription-Id': sub.id,
          },
        });

        if (sendResult.success) {
          await adminSupabase
            .from('subscriptions')
            .update({
              trial_day5_reminder_sent_at: nowIso,
              updated_at: nowIso,
            })
            .eq('id', sub.id);

          day5RemindersSent++;

          try {
            await adminSupabase.from('audit_logs').insert({
              business_id: sub.business_id,
              user_id: sub.user_id || null,
              action: 'TRIAL_REMINDER_DAY5_SENT',
              entity: 'subscription',
              entity_id: sub.id,
              metadata: {
                recipient: recipientEmail,
                message_id: sendResult.messageId,
                sent_at: nowIso,
                remaining_hours: Math.round(remainingHours * 10) / 10,
              },
            });
          } catch {}
        } else {
          errors.push(`Failed to send Day 5 email for sub ${sub.id}: ${sendResult.error}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: nowIso,
      processedCount,
      day5RemindersSent,
      day7RemindersSent,
      expiredCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Unexpected failure during trial reminders cron',
      },
      { status: 500 }
    );
  }
}
