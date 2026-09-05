import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EntitlementService } from '@/lib/billing/entitlements';
import { ProductionLogger } from '@/lib/monitoring/logger';
import crypto from 'crypto';

/**
 * OmniDimension AI Voice Webhook Router
 * Handles Pre-Call Quota Authorization (blocks call if minutes exhausted)
 * and Post-Call Duration Logging (converts seconds to billable minutes).
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-omnidimension-signature') || req.headers.get('x-signature');
    const webhookSecret = process.env.OMNIDIMENSION_WEBHOOK_SECRET;

    // Verify HMAC-SHA256 signature if webhook secret configured
    if (webhookSecret && signature) {
      const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const event = payload.event || payload.type || 'call_completed';
    const agentId = payload.agent_id || payload.agentId;
    const callId = payload.call_id || payload.id || `call_${Date.now()}`;
    const callerNumber = payload.caller_number || payload.from || payload.caller;
    const businessId = payload.business_id || payload.businessId || payload.metadata?.business_id;

    const adminSupabase = createAdminClient();

    // Resolve business by ID or by agent ID if businessId missing in payload
    let targetBusinessId = businessId;
    let businessRecord: any = null;

    if (targetBusinessId) {
      const { data } = await adminSupabase.from('businesses').select('*').eq('id', targetBusinessId).maybeSingle();
      businessRecord = data;
    } else if (agentId) {
      const { data } = await adminSupabase
        .from('businesses')
        .select('*')
        .eq('omnidimension_agent_id', agentId)
        .maybeSingle();
      if (data) {
        businessRecord = data;
        targetBusinessId = data.id;
      }
    }

    if (!targetBusinessId || !businessRecord) {
      ProductionLogger.warn('RECEPTIONIST', `OmniDimension webhook received for unmapped business (agentId: ${agentId})`);
      return NextResponse.json({ success: true, message: 'Received without workspace match' });
    }

    const entitlementService = new EntitlementService(adminSupabase);

    // 1. PRE-CALL AUTHORIZATION CHECK: Block call if minutes quota is exhausted
    if (event === 'call_initiated' || event === 'pre_call_check' || event === 'call.created') {
      const check = await entitlementService.assertUsageLimit(targetBusinessId, 'ai_receptionist_minutes', 1);

      if (!check.allowed) {
        ProductionLogger.warn(
          'RECEPTIONIST',
          `BLOCKED incoming call for business ${targetBusinessId}: ${check.reason}`
        );

        return NextResponse.json({
          allowed: false,
          action: 'block',
          reason: check.reason,
          message: 'Monthly AI Receptionist minutes quota exceeded. Please upgrade your plan to receive more calls.',
          overageRate: check.overageRate,
        }, { status: 403 });
      }

      return NextResponse.json({
        allowed: true,
        action: 'connect',
        businessId: targetBusinessId,
        agentId: businessRecord.omnidimension_agent_id,
        currentUsage: check.currentUsage,
        limit: check.limit,
      });
    }

    // 2. POST-CALL DURATION LOGGING: Convert call duration into billable minutes
    if (
      event === 'call_completed' ||
      event === 'call.ended' ||
      event === 'call_analyzed' ||
      event === 'call_finished'
    ) {
      const durationSeconds = Number(
        payload.call_duration_seconds || payload.duration_seconds || payload.duration || 0
      );

      // Standard telco billing: round up to nearest minute (minimum 1 minute)
      const billableMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
      const tier = businessRecord.receptionist_provisioning_tier || 'paid';

      // Record usage in usage_records
      await entitlementService.recordUsage(targetBusinessId, 'ai_receptionist_minutes', billableMinutes);
      // Also update legacy chats counter for backwards compatibility
      await entitlementService.recordUsage(targetBusinessId, 'ai_receptionist_chats', 1);

      // Save conversation record in receptionist_conversations
      const summaryText = payload.summary || payload.transcript_summary || payload.notes || '';
      const transcript = payload.transcript || payload.messages || [];

      try {
        await adminSupabase.from('receptionist_conversations').insert({
          business_id: targetBusinessId,
          channel: 'VOICE',
          state: 'COMPLETED',
          customer_phone: callerNumber || undefined,
          detected_intent: payload.detected_intent || 'GENERAL_INQUIRY',
          intent_confidence: payload.intent_confidence || 0.9,
          urgency: payload.is_emergency ? 'urgent' : 'medium',
          metadata: {
            omnidimension_call_id: callId,
            duration_seconds: durationSeconds,
            billable_minutes: billableMinutes,
            summary: summaryText,
            tier,
            recording_url: payload.recording_url || payload.audio_url,
            cost_estimate_usd: (billableMinutes * (tier === 'trial' ? 0.05 : 0.08)).toFixed(3),
          },
        } as any);
      } catch (err: any) {
        ProductionLogger.warn('RECEPTIONIST', `Notice: Conversation record save: ${err.message}`);
      }

      ProductionLogger.info(
        'RECEPTIONIST',
        `OmniDimension call completed for business ${targetBusinessId}: ${durationSeconds}s -> ${billableMinutes} billable minutes recorded (${tier} tier)`
      );

      return NextResponse.json({
        success: true,
        businessId: targetBusinessId,
        billableMinutes,
        durationSeconds,
        tier,
      });
    }

    return NextResponse.json({ success: true, message: `Event ${event} acknowledged.` });
  } catch (error: any) {
    ProductionLogger.error('RECEPTIONIST', `OmniDimension webhook error: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
