interface RateLimitRecord {
  timestamps: number[];
}

export class EmailRateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();

  // Config: Max 20 emails per minute, Max 100 per hour per business
  constructor(
    private maxPerMinute = 20,
    private maxPerHour = 100
  ) {}

  checkRateLimit(businessId: string): { allowed: boolean; retryAfterSeconds?: number; message?: string } {
    const now = Date.now();
    const record = this.records.get(businessId) || { timestamps: [] };

    // Clean timestamps older than 1 hour (3,600,000 ms)
    const oneHourAgo = now - 3600 * 1000;
    const oneMinuteAgo = now - 60 * 1000;

    const validTimestamps = record.timestamps.filter(ts => ts > oneHourAgo);
    this.records.set(businessId, { timestamps: validTimestamps });

    const sendsInLastMinute = validTimestamps.filter(ts => ts > oneMinuteAgo).length;
    if (sendsInLastMinute >= this.maxPerMinute) {
      return {
        allowed: false,
        retryAfterSeconds: 60,
        message: `Rate limit reached: Maximum ${this.maxPerMinute} emails per minute per business. Please wait before sending again.`,
      };
    }

    if (validTimestamps.length >= this.maxPerHour) {
      return {
        allowed: false,
        retryAfterSeconds: 3600,
        message: `Hourly rate limit reached: Maximum ${this.maxPerHour} emails per hour per business.`,
      };
    }

    return { allowed: true };
  }

  recordSend(businessId: string): void {
    const now = Date.now();
    const record = this.records.get(businessId) || { timestamps: [] };
    record.timestamps.push(now);
    this.records.set(businessId, record);
  }

  reset(businessId?: string): void {
    if (businessId) {
      this.records.delete(businessId);
    } else {
      this.records.clear();
    }
  }
}

export const globalEmailRateLimiter = new EmailRateLimiter();
