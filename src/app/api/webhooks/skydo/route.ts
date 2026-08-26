import { NextRequest, NextResponse } from 'next/server';
import { SkydoWebhookHandler } from '@/lib/payments/webhooks/skydo';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductionLogger } from '@/lib/monitoring/logger';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-skydo-signature') || req.headers.get('skydo-signature') || '';

    if (!signature) {
      ProductionLogger.warn('WEBHOOK', 'Skydo webhook rejected: Missing signature header');
      return NextResponse.json(
        { error: 'Missing skydo-signature header' },
        { status: 400 }
      );
    }

    if (!rawBody || rawBody.trim() === '') {
      ProductionLogger.warn('WEBHOOK', 'Skydo webhook rejected: Empty request payload');
      return NextResponse.json(
        { error: 'Empty payload' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const apiKey = process.env.SKYDO_API_KEY;
    const webhookSecret = process.env.SKYDO_WEBHOOK_SECRET || 'skydo_whsec_placeholder';
    const handler = new SkydoWebhookHandler(adminSupabase, apiKey, webhookSecret);

    const result = await handler.handleWebhook(rawBody, signature, webhookSecret);

    if (!result.success) {
      ProductionLogger.warn('WEBHOOK', `Skydo webhook verification failed: ${result.error}`);
      return NextResponse.json(
        { error: result.error || 'Invalid webhook signature or payload' },
        { status: 400 }
      );
    }

    if (result.duplicate) {
      ProductionLogger.info('WEBHOOK', `Skydo webhook duplicate event ignored: ${result.eventId}`);
      return NextResponse.json(
        { received: true, duplicate: true, eventId: result.eventId },
        { status: 200 }
      );
    }

    ProductionLogger.info('WEBHOOK', `Skydo webhook processed successfully: ${result.eventId}`);
    return NextResponse.json(
      { received: true, eventId: result.eventId },
      { status: 200 }
    );
  } catch (error: unknown) {
    ProductionLogger.error('WEBHOOK', 'Skydo webhook internal processing error', error);
    return NextResponse.json(
      { error: 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Skydo Webhook Endpoint Active (POST required)' },
    { status: 405 }
  );
}
