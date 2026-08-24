import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { createAdminClient } from '../supabase/admin';

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
 * Server-side operations utilize service-role admin client to comply with RLS lockdowns.
 */
export class DistributedRateLimiter implements RateLimiter {
  private inMemoryFallback: Map<string, { count: number; expiresAt: number }> = new Map();
  private dbClient: SupabaseClient<Database> | null = null;

  constructor(
    client?: SupabaseClient<Database> | null,
    private maxPerMinute = 10,
    private windowSeconds = 60
  ) {
    if (client !== undefined) {
      this.dbClient = client;
    } else if (typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        this.dbClient = createAdminClient();
      } catch {
        this.dbClient = null;
      }
    }
  }

  private getEffectiveClient(): SupabaseClient<Database> | null {
    if (this.dbClient !== null && this.dbClient !== undefined) return this.dbClient;
    if (this.dbClient === null) return null; // Explicit in-memory mode
    if (typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        return createAdminClient();
      } catch {
        return null;
      }
    }
    return null;
  }

  async checkRateLimit(key: string): Promise<RateLimitResult> {
    const now = new Date();
    const effectiveClient = this.getEffectiveClient();

    // If Supabase client is available, check persistent distributed table
    if (effectiveClient) {
      try {
        const { data: record, error } = await effectiveClient
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
      } catch {
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
    const effectiveClient = this.getEffectiveClient();

    // 1. Update in-memory cache
    const local = this.inMemoryFallback.get(key);
    if (!local || now.getTime() >= local.expiresAt) {
      this.inMemoryFallback.set(key, { count: 1, expiresAt: expiresAt.getTime() });
    } else {
      local.count += 1;
    }

    // 2. Update persistent distributed database record if Supabase client is active
    if (effectiveClient) {
      try {
        const { data: existing } = await effectiveClient
          .from('rate_limits')
          .select('*')
          .eq('key', key)
          .single();

        if (existing && new Date(existing.expires_at).getTime() > now.getTime()) {
          await effectiveClient
            .from('rate_limits')
            .update({
              count: existing.count + 1,
            })
            .eq('key', key);
        } else {
          await effectiveClient
            .from('rate_limits')
            .upsert({
              key,
              count: 1,
              window_start: now.toISOString(),
              expires_at: expiresAt.toISOString(),
            });
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.warn('Distributed rate limit write notice:', errMsg);
      }
    }
  }

  async reset(key?: string): Promise<void> {
    const effectiveClient = this.getEffectiveClient();
    if (key) {
      this.inMemoryFallback.delete(key);
      if (effectiveClient) {
        try {
          await effectiveClient.from('rate_limits').delete().eq('key', key);
        } catch {}
      }
    } else {
      this.inMemoryFallback.clear();
      if (effectiveClient) {
        try {
          await effectiveClient.from('rate_limits').delete().neq('key', '');
        } catch {}
      }
    }
  }
}
