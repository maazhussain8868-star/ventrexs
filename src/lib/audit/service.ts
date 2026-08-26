import { AuditLogEvent } from '../agency/types';

export class AuditService {
  private static sensitiveKeys = [
    'password',
    'secret',
    'token',
    'api_key',
    'apikey',
    'authorization',
    'credit_card',
    'card_number',
    'cvc',
    'ssn',
    'stripe_secret_key',
  ];

  /**
   * Sanitizes payload removing all passwords, tokens, API keys, and card numbers
   */
  static sanitizeMetadata(meta: any): any {
    if (!meta || typeof meta !== 'object') return meta;
    if (Array.isArray(meta)) return meta.map((m) => this.sanitizeMetadata(m));

    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(meta)) {
      const lower = k.toLowerCase();
      if (this.sensitiveKeys.some((s) => lower.includes(s))) {
        clean[k] = '[REDACTED]';
      } else if (typeof v === 'object' && v !== null) {
        clean[k] = this.sanitizeMetadata(v);
      } else {
        clean[k] = v;
      }
    }
    return clean;
  }

  /**
   * Creates structured audit log payload
   */
  static formatAuditEvent(params: {
    actorEmail: string;
    actorRole: string;
    eventType: string;
    description: string;
    businessId?: string;
    agencyId?: string;
    userId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
  }): Omit<AuditLogEvent, 'id' | 'createdAt'> {
    return {
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      eventType: params.eventType,
      description: params.description,
      businessId: params.businessId,
      agencyId: params.agencyId,
      userId: params.userId,
      ipAddress: params.ipAddress || '127.0.0.1',
      metadata: this.sanitizeMetadata(params.metadata || {}),
    };
  }

  /**
   * Logs an immutable audit event
   */
  static logEvent(params: {
    actorEmail: string;
    actorRole: string;
    eventType: string;
    description: string;
    businessId?: string;
    agencyId?: string;
    userId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
  }): AuditLogEvent {
    const formatted = this.formatAuditEvent(params);
    const event: AuditLogEvent = {
      ...formatted,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    return event;
  }

  /**
   * Alias for logEvent
   */
  static logAuditEvent(params: {
    actorEmail: string;
    actorRole: string;
    eventType: string;
    description: string;
    businessId?: string;
    agencyId?: string;
    userId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): AuditLogEvent {
    return this.logEvent(params);
  }
}

