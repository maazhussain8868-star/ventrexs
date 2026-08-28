/**
 * VENTREXS AI — PRODUCTION PAYMENT & SUBSCRIPTION RECONCILIATION ENGINE
 *
 * Compares external provider records against internal database ledgers and subscription states
 * to detect variances, double-charges, currency mismatches, and orphan transactions.
 */

import {
  PaymentProviderName,
  PaymentTransactionRecord,
  ReconciliationReport,
  PaymentPurpose,
} from './types';

export interface ExternalProviderTransaction {
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  purpose?: PaymentPurpose;
  subscriptionId?: string;
  createdAt: string;
}

export interface InternalSubscriptionRecord {
  id: string;
  businessId?: string;
  agencyId?: string;
  plan: string;
  status: string;
  priceAmount: number;
  currency: string;
  providerSubscriptionId?: string;
  currentPeriodEnd: string;
}

export interface AdvancedReconciliationReport extends ReconciliationReport {
  saasRevenueTotal: number;
  customerInvoiceTotal: number;
  subscriptionAuditDiscrepancies: {
    subscriptionId: string;
    reason: string;
  }[];
}

export class PaymentReconciliationEngine {
  /**
   * Reconciles external provider records against internal payment & SaaS revenue ledgers
   */
  static reconcile(params: {
    provider: PaymentProviderName;
    periodStart: string;
    periodEnd: string;
    internalRecords: PaymentTransactionRecord[];
    externalRecords: ExternalProviderTransaction[];
    subscriptions?: InternalSubscriptionRecord[];
  }): AdvancedReconciliationReport {
    const { provider, periodStart, periodEnd, internalRecords, externalRecords, subscriptions = [] } = params;

    let matchedCount = 0;
    let totalAmountCollected = 0;
    let totalAmountRefunded = 0;
    let saasRevenueTotal = 0;
    let customerInvoiceTotal = 0;

    const discrepancies: ReconciliationReport['discrepancies'] = [];
    const subscriptionAuditDiscrepancies: { subscriptionId: string; reason: string }[] = [];

    const internalMap = new Map<string, PaymentTransactionRecord>();
    for (const rec of internalRecords) {
      if (rec.providerPaymentId) {
        internalMap.set(rec.providerPaymentId, rec);
      }
      if (rec.status === 'SUCCEEDED') {
        const amt = Number(rec.amount);
        totalAmountCollected += amt;
        if (rec.purpose === 'SAAS_SUBSCRIPTION') {
          saasRevenueTotal += amt;
        } else if (rec.purpose === 'CUSTOMER_INVOICE') {
          customerInvoiceTotal += amt;
        }
      }
      if (rec.status === 'REFUNDED' || rec.status === 'PARTIALLY_REFUNDED') {
        totalAmountRefunded += Number(rec.refundedAmount || rec.amount);
      }
    }

    const matchedExternalIds = new Set<string>();

    for (const ext of externalRecords) {
      const match = internalMap.get(ext.providerPaymentId);
      if (!match) {
        discrepancies.push({
          transactionId: ext.providerPaymentId,
          expectedAmount: 0,
          actualAmount: ext.amount,
          reason: `External transaction ${ext.providerPaymentId} exists in ${provider} but missing in internal database ledger.`,
        });
      } else {
        matchedExternalIds.add(ext.providerPaymentId);
        const internalAmountCents = Math.round(Number(match.amount) * 100);
        const externalAmountCents = Math.round(Number(ext.amount) * 100);

        if (internalAmountCents !== externalAmountCents) {
          discrepancies.push({
            transactionId: ext.providerPaymentId,
            expectedAmount: match.amount,
            actualAmount: ext.amount,
            reason: `Amount mismatch: Internal shows $${match.amount}, provider shows $${ext.amount}.`,
          });
        } else if (match.currency && ext.currency && match.currency.toUpperCase() !== ext.currency.toUpperCase()) {
          discrepancies.push({
            transactionId: ext.providerPaymentId,
            expectedAmount: match.amount,
            actualAmount: ext.amount,
            reason: `Currency mismatch: Internal has ${match.currency}, external has ${ext.currency}.`,
          });
        } else {
          matchedCount++;
        }
      }
    }

    // Check for internal records that don't exist in provider
    for (const intRec of internalRecords) {
      if (intRec.providerPaymentId && !matchedExternalIds.has(intRec.providerPaymentId)) {
        discrepancies.push({
          transactionId: intRec.providerPaymentId,
          expectedAmount: intRec.amount,
          actualAmount: 0,
          reason: `Internal transaction ${intRec.id} (${intRec.providerPaymentId}) missing in provider records.`,
        });
      }
    }

    // Check subscription status synchronization
    for (const sub of subscriptions) {
      if (sub.status === 'active') {
        const hasVerifiedPayment = internalRecords.some(
          (r) =>
            (r.businessId === sub.businessId || r.agencyId === sub.agencyId) &&
            r.status === 'SUCCEEDED' &&
            r.purpose === 'SAAS_SUBSCRIPTION'
        );
        if (!hasVerifiedPayment && sub.plan !== 'Trial') {
          subscriptionAuditDiscrepancies.push({
            subscriptionId: sub.id,
            reason: `Subscription ${sub.id} is ACTIVE but has no matching verified SAAS_SUBSCRIPTION payment in ledger.`,
          });
        }
      }
    }

    return {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      provider,
      periodStart,
      periodEnd,
      totalTransactionsCount: internalRecords.length,
      totalAmountCollected: Math.round(totalAmountCollected * 100) / 100,
      totalAmountRefunded: Math.round(totalAmountRefunded * 100) / 100,
      matchedCount,
      discrepancyCount: discrepancies.length + subscriptionAuditDiscrepancies.length,
      discrepancies,
      saasRevenueTotal: Math.round(saasRevenueTotal * 100) / 100,
      customerInvoiceTotal: Math.round(customerInvoiceTotal * 100) / 100,
      subscriptionAuditDiscrepancies,
      generatedAt: new Date().toISOString(),
    };
  }
}
