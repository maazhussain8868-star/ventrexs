import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { InboundReplyRouter } from '@/lib/communications/reply-router';
import { CommunicationChannel } from '@/lib/supabase/types';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-ventrexs-signature') || req.headers.get('x-paypilot-signature') || req.headers.get('x-provider-signature');

    // Webhook signature verification if secret configured
    const webhookSecret = process.env.COMMUNICATION_WEBHOOK_SECRET;
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing webhook signature' }, { status: 401 });
      }
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // 1. Handle Delivery Status Callback
    if (payload.event === 'delivery_status') {
      const { provider_message_id, status, error_message, communication_id } = payload;

      let query = supabase.from('communications').update({
        delivery_status: status === 'delivered' ? 'delivered' : 'failed',
        status: status === 'delivered' ? 'delivered' : 'failed',
        error_message: error_message || null,
      });

      if (communication_id) {
        query = query.eq('id', communication_id);
      } else if (provider_message_id) {
        query = query.eq('provider_message_id', provider_message_id);
      }

      await query;
      return NextResponse.json({ success: true, event: 'delivery_status_updated' });
    }

    // 2. Handle Inbound Message Callback
    if (payload.event === 'inbound_message' || payload.Body || payload.text) {
      const channel: CommunicationChannel = payload.channel || (payload.From?.startsWith('whatsapp:') ? 'whatsapp' : 'sms');
      const sender = payload.From || payload.sender || payload.from;
      const body = payload.Body || payload.text || payload.message;
      const businessId = payload.business_id;

      const router = new InboundReplyRouter(supabase);
      const result = await router.handleInboundMessage({
        channel,
        senderIdentifier: sender,
        senderName: payload.sender_name,
        messageText: body,
        businessId,
        providerMessageId: payload.MessageSid || payload.id,
        rawPayload: payload,
      });

      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ success: true, message: 'Event received' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
