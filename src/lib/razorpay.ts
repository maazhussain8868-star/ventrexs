import crypto from 'crypto';

export interface RazorpayOrderOptions {
  amount: number; // in smallest currency unit (e.g. paise for INR, cents for USD)
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpaySubscriptionOptions {
  planId: string;
  totalCount?: number;
  customerNotify?: 1 | 0;
  quantity?: number;
  startAt?: number;
  notes?: Record<string, string>;
}

export interface RazorpaySubscriptionResponse {
  id: string;
  entity: string;
  plan_id: string;
  status: string;
  current_start: number | null;
  current_end: number | null;
  ended_at: number | null;
  quantity: number;
  notes: Record<string, string>;
  charge_at: number | null;
  start_at: number | null;
  end_at: number | null;
  auth_attempts: number;
  total_count: number;
  paid_count: number;
  remaining_count: number;
  short_url: string;
}

/**
 * Server-side Razorpay client utility for Ventrexs SaaS subscriptions.
 * Operates strictly server-side using secure REST API requests with Basic Auth and crypto verification.
 */
export class RazorpayClient {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor(keyId?: string, keySecret?: string, webhookSecret?: string) {
    this.keyId = keyId || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    this.keySecret = keySecret || process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || '';
  }

  public get isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret);
  }

  public getKeyId(): string {
    return this.keyId;
  }

  private getAuthHeader(): string {
    const token = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    return `Basic ${token}`;
  }

  /**
   * Create an Order for payment collection
   */
  async createOrder(options: RazorpayOrderOptions): Promise<RazorpayOrderResponse> {
    if (!this.isConfigured) {
      throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }

    if (this.keyId === 'rzp_test_paypilot_local' || this.keyId.startsWith('rzp_test_mock')) {
      return {
        id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        entity: 'order',
        amount: Math.round(options.amount),
        amount_paid: 0,
        amount_due: Math.round(options.amount),
        currency: options.currency.toUpperCase(),
        receipt: options.receipt || `rcpt_${Date.now()}`,
        status: 'created',
        attempts: 0,
        notes: options.notes || {},
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    const payload = {
      amount: Math.round(options.amount),
      currency: options.currency.toUpperCase(),
      receipt: options.receipt || `rcpt_${Date.now()}`,
      notes: options.notes || {},
    };

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Razorpay createOrder failed (${res.status}): ${errBody}`);
    }

    return (await res.json()) as RazorpayOrderResponse;
  }

  /**
   * Create a Subscription plan on Razorpay
   */
  async createSubscription(options: RazorpaySubscriptionOptions): Promise<RazorpaySubscriptionResponse> {
    if (!this.isConfigured) {
      throw new Error('Razorpay credentials not configured.');
    }

    const payload: Record<string, unknown> = {
      plan_id: options.planId,
      total_count: options.totalCount ?? 12,
      customer_notify: options.customerNotify ?? 1,
      quantity: options.quantity ?? 1,
      notes: options.notes ?? {},
    };
    if (options.startAt) {
      payload.start_at = options.startAt;
    }

    const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Razorpay createSubscription failed (${res.status}): ${errBody}`);
    }

    return (await res.json()) as RazorpaySubscriptionResponse;
  }

  /**
   * Fetch payment details by ID
   */
  async getPayment(paymentId: string): Promise<Record<string, unknown>> {
    if (!this.isConfigured) throw new Error('Razorpay credentials not configured.');

    const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Razorpay getPayment failed (${res.status}): ${errBody}`);
    }

    return await res.json();
  }

  /**
   * Verify client-side Razorpay modal payment completion signature
   */
  verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    if (!this.keySecret) return false;
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${params.orderId}|${params.paymentId}`)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(params.signature, 'utf8')
      );
    } catch {
      return false;
    }
  }

  /**
   * Verify subscription-specific signature (subscription_id|payment_id)
   */
  verifySubscriptionPaymentSignature(params: {
    subscriptionId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    if (!this.keySecret) return false;
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${params.paymentId}|${params.subscriptionId}`)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(params.signature, 'utf8')
      );
    } catch {
      return false;
    }
  }

  /**
   * Verify Razorpay Webhook Signature
   */
  verifyWebhookSignature(rawBody: string, signature: string, customSecret?: string): boolean {
    const secret = customSecret || this.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || '';
    if (!secret || !signature || !rawBody) return false;

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf8');
      const sigBuf = Buffer.from(signature, 'utf8');

      if (expectedBuf.length !== sigBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuf, sigBuf);
    } catch {
      return false;
    }
  }
}

// Singleton helper
let razorpayInstance: RazorpayClient | null = null;
export function getRazorpayClient(): RazorpayClient {
  if (!razorpayInstance) {
    razorpayInstance = new RazorpayClient();
  }
  return razorpayInstance;
}
