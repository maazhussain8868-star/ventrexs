import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  message?: string;
}

export interface RateLimiter {
  checkRateLimit(key: string): Promise<RateLimitResult>;
  recordSend(key: string): Promise<void>;
  reset(key?: string): Promise<void>;
}

/**
 * Production-ready distributed rate limiter backed by Postgres (Supabase rate_limits table)
 * Compatible with Redis/Upstash by conforming to the RateLimiter interface.
 */
export class DistributedRateLimiter implements RateLimiter {
  private inMemoryFallback: Map<string, { count: number; expiresAt: number }> = new Map();

  constructor(
    private client?: SupabaseClient<Database> | null,
    private maxPerMinute = 10,
    private windowSeconds = 60
  ) {}

  async checkRateLimit(key: string): Promise<RateLimitResult> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.windowSeconds * 1000);

    // If Supabase client is available, check persistent distributed table
    if (this.client) {
      try {
        const { data: record, error } = await this.client
          .from('rate_limits')
          .select('*')
          .eq('key', key)
          .single();

        if (!error && record) {
          const recordExpires = new Date(record.expires_at).getTime();
          if (now.getTime() < recordExpires) {
            if (record.count >= this.maxPerMinute) {
              const retryAfter = Math.ceil((recordExpires - now.getTime()) / 1000);
              return {
                allowed: false,
                retryAfterSeconds: retryAfter,
                message: `SMS Rate limit reached: Maximum ${this.maxPerMinute} messages per minute per business. Try again in ${retryAfter}s.`,
              };
            }
          }
        }
      } catch (e) {
        // Fallback to in-memory check
      }
    }

    // In-memory fallback check
    const local = this.inMemoryFallback.get(key);
    if (local && now.getTime() < local.expiresAt) {
      if (local.count >= this.maxPerMinute) {
        const retryAfter = Math.ceil((local.expiresAt - now.getTime()) / 1000);
        return {
          allowed: false,
          retryAfterSeconds: retryAfter,
          message: `SMS Rate limit reached: Maximum ${this.maxPerMinute} messages per minute per business. Try again in ${retryAfter}s.`,
        };
      }
    }

    return { allowed: true };
  }

  async recordSend(key: string): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.windowSeconds * 1000);

    // 1. Update in-memory cache
    const local = this.inMemoryFallback.get(key);
    if (!local || now.getTime() >= local.expiresAt) {
      this.inMemoryFallback.set(key, { count: 1, expiresAt: expiresAt.getTime() });
    } else {
      local.count += 1;
    }

    // 2. Update persistent distributed database record if Supabase client is active
    if (this.client) {
      try {
        const { data: existing } = await this.client
          .from('rate_limits')
          .select('*')
          .eq('key', key)
          .single();

        if (existing && new Date(existing.expires_at).getTime() > now.getTime()) {
          await this.client
            .from('rate_limits')
            .update({
              count: existing.count + 1,
            })
            .eq('key', key);
        } else {
          await this.client
            .from('rate_limits')
            .upsert({
              key,
              count: 1,
              window_start: now.toISOString(),
              expires_at: expiresAt.toISOString(),
            });
        }
      } catch (e: any) {
        console.warn('Distributed rate limit write notice:', e?.message);
      }
    }
  }

  async reset(key?: string): Promise<void> {
    if (key) {
      this.inMemoryFallback.delete(key);
      if (this.client) {
        try {
          await this.client.from('rate_limits').delete().eq('key', key);
        } catch (e) {}
      }
    } else {
      this.inMemoryFallback.clear();
      if (this.client) {
        try {
          await this.client.from('rate_limits').delete().neq('key', '');
        } catch (e) {}
      }
    }
  }
}
