import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/billing/billing-service';
import { StripePaymentProviderAdapter } from '@/lib/billing/providers/stripe-adapter';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductionLogger } from '@/lib/monitoring/logger';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    if (!signature) {
      ProductionLogger.warn('WEBHOOK', 'Stripe webhook rejected: Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!rawBody || rawBody.trim() === '') {
      ProductionLogger.warn('WEBHOOK', 'Stripe webhook rejected: Empty request payload');
      return NextResponse.json(
        { error: 'Empty payload' },
        { status: 400 }
      );
    }

    // Initialize BillingService with service-role admin client for secure server-side execution
    const adminSupabase = createAdminClient();
    const billingService = new BillingService(adminSupabase);

    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';
    const stripeProvider = new StripePaymentProviderAdapter(stripeKey, webhookSecret);

    // Process webhook via BillingService (cryptographic signature verification, idempotency check, and state update)
    const result = await billingService.handleWebhook(rawBody, signature, webhookSecret, stripeProvider);

    if (!result.success) {
      ProductionLogger.warn('WEBHOOK', `Stripe webhook verification failed: ${result.error}`);
      return NextResponse.json(
        { error: result.error || 'Invalid webhook signature or payload' },
        { status: 400 }
      );
    }

    if (result.duplicate) {
      ProductionLogger.info('WEBHOOK', `Stripe webhook duplicate event ignored: ${result.eventId}`);
      return NextResponse.json(
        { received: true, duplicate: true, eventId: result.eventId },
        { status: 200 }
      );
    }

    ProductionLogger.info('WEBHOOK', `Stripe webhook processed successfully: ${result.eventId}`);
    return NextResponse.json(
      { received: true, eventId: result.eventId },
      { status: 200 }
    );
  } catch (error: unknown) {
    ProductionLogger.error('WEBHOOK', 'Stripe webhook internal processing error', error);
    return NextResponse.json(
      { error: 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Stripe Webhook Endpoint Active (POST required)' },
    { status: 405 }
  );
}
