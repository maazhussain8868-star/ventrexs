/**
 * PayPilot AI — Production-Safe Monitoring & Structured Logger
 * Sanitizes all metadata, ensures zero secret/credential leakage, and emits structured logs.
 */

export type LogCategory =
  | 'AUTH'
  | 'BILLING'
  | 'EMAIL'
  | 'SMS'
  | 'WHATSAPP'
  | 'AI_COPILOT'
  | 'WEBHOOK'
  | 'SYSTEM'
  | 'SECURITY';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  category: LogCategory;
  message: string;
  metadata?: Record<string, any>;
  errorDetails?: {
    name: string;
    message: string;
  };
}

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'api_key',
  'apikey',
  'client_secret',
  'authorization',
  'cookie',
  'card',
  'cvv',
  'account_sid',
  'auth_token',
];

export function sanitizeLogData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export class ProductionLogger {
  private static formatEntry(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  static info(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      category,
      message,
      metadata: metadata ? sanitizeLogData(metadata) : undefined,
    };
    console.log(this.formatEntry(entry));
  }

  static warn(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      category,
      message,
      metadata: metadata ? sanitizeLogData(metadata) : undefined,
    };
    console.warn(this.formatEntry(entry));
  }

  static error(
    category: LogCategory,
    message: string,
    error?: Error | unknown,
    metadata?: Record<string, any>
  ): void {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: error.message }
      : error
      ? { name: 'UnknownError', message: String(error) }
      : undefined;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      category,
      message,
      metadata: metadata ? sanitizeLogData(metadata) : undefined,
      errorDetails,
    };
    console.error(this.formatEntry(entry));
  }
}
