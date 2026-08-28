import { NextRequest, NextResponse } from 'next/server';
import { RazorpayWebhookHandler } from '@/lib/payments/webhooks/razorpay';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductionLogger } from '@/lib/monitoring/logger';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    if (!signature) {
      ProductionLogger.warn('WEBHOOK', 'Razorpay webhook rejected: Missing x-razorpay-signature header');
      return NextResponse.json(
        { error: 'Missing x-razorpay-signature header' },
        { status: 400 }
      );
    }

    if (!rawBody || rawBody.trim() === '') {
      ProductionLogger.warn('WEBHOOK', 'Razorpay webhook rejected: Empty request payload');
      return NextResponse.json(
        { error: 'Empty payload' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      ProductionLogger.error('WEBHOOK', 'Razorpay webhook rejected: webhook secret is not configured');
      return NextResponse.json(
        { error: 'Razorpay webhook is not configured.' },
        { status: 503 }
      );
    }

    const adminSupabase = createAdminClient();
    const handler = new RazorpayWebhookHandler(adminSupabase, webhookSecret);

    const result = await handler.handleWebhook(rawBody, signature, webhookSecret);

    if (!result.success) {
      ProductionLogger.warn('WEBHOOK', `Razorpay webhook verification failed: ${result.error}`);
      return NextResponse.json(
        { error: result.error || 'Invalid webhook signature or payload' },
        { status: 400 }
      );
    }

    if (result.duplicate) {
      ProductionLogger.info('WEBHOOK', `Razorpay webhook duplicate event ignored: ${result.eventId}`);
      return NextResponse.json(
        { received: true, duplicate: true, eventId: result.eventId },
        { status: 200 }
      );
    }

    ProductionLogger.info('WEBHOOK', `Razorpay webhook processed successfully: ${result.eventId}`);
    return NextResponse.json(
      { received: true, eventId: result.eventId },
      { status: 200 }
    );
  } catch (error: unknown) {
    ProductionLogger.error('WEBHOOK', 'Razorpay webhook internal processing error', error);
    return NextResponse.json(
      { error: 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Razorpay Webhook Endpoint Active (POST required)' },
    { status: 405 }
  );
}
