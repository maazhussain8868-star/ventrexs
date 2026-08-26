/**
 * VENTREXS AI — PHASE 14: IDEMPOTENCY ENGINE
 * Strict duplicate prevention for checkouts, payments, refunds, and webhooks
 */

import crypto from 'crypto';

export interface IdempotencyRecord {
  key: string;
  scope: 'checkout' | 'payment' | 'refund' | 'webhook' | 'subscription_activation';
  resourceId?: string;
  responsePayload: any;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  expiresAt: string;
}

export class IdempotencyManager {
  private static inMemoryStore = new Map<string, IdempotencyRecord>();

  /**
   * Generates a deterministic or cryptographic idempotency key
   */
  static generateKey(prefix: string, ...identifiers: (string | number | undefined)[]): string {
    const raw = identifiers.filter((id) => id !== undefined).join(':');
    const hash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 24);
    return `${prefix}_${hash}`;
  }

  /**
   * Checks if an idempotency key is already cached/processed
   */
  static async check(key: string): Promise<IdempotencyRecord | null> {
    const record = this.inMemoryStore.get(key);
    if (!record) return null;

    if (new Date(record.expiresAt) < new Date()) {
      this.inMemoryStore.delete(key);
      return null;
    }
    return record;
  }

  /**
   * Records an idempotency entry
   */
  static async set(
    key: string,
    scope: IdempotencyRecord['scope'],
    responsePayload: any,
    ttlSeconds: number = 86400,
    resourceId?: string
  ): Promise<IdempotencyRecord> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();

    const record: IdempotencyRecord = {
      key,
      scope,
      resourceId,
      responsePayload,
      status: 'COMPLETED',
      createdAt: now.toISOString(),
      expiresAt,
    };

    this.inMemoryStore.set(key, record);
    return record;
  }

  /**
   * Wraps an asynchronous operation in an idempotent execution block
   */
  static async executeIdempotent<T>(
    key: string,
    scope: IdempotencyRecord['scope'],
    operation: () => Promise<T>,
    ttlSeconds: number = 86400,
    resourceId?: string
  ): Promise<{ result: T; wasCached: boolean }> {
    const existing = await this.check(key);
    if (existing && existing.status === 'COMPLETED') {
      return {
        result: existing.responsePayload as T,
        wasCached: true,
      };
    }

    const result = await operation();
    await this.set(key, scope, result, ttlSeconds, resourceId);
    return {
      result,
      wasCached: false,
    };
  }

  /**
   * Clears memory cache (useful for testing)
   */
  static clear(): void {
    this.inMemoryStore.clear();
  }
}
