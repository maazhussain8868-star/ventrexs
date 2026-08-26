/**
 * VENTREXS AI — PHASE 14: RECONCILIATION ENGINE
 * Compares external provider records against internal database ledgers to detect variances
 */

import {
  PaymentProviderName,
  PaymentTransactionRecord,
  ReconciliationReport,
} from './types';

export interface ExternalProviderTransaction {
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

export class PaymentReconciliationEngine {
  /**
   * Reconciles external provider transaction records against internal database transaction ledgers
   */
  static reconcile(params: {
    provider: PaymentProviderName;
    periodStart: string;
    periodEnd: string;
    internalRecords: PaymentTransactionRecord[];
    externalRecords: ExternalProviderTransaction[];
  }): ReconciliationReport {
    const { provider, periodStart, periodEnd, internalRecords, externalRecords } = params;

    let matchedCount = 0;
    let totalAmountCollected = 0;
    let totalAmountRefunded = 0;
    const discrepancies: ReconciliationReport['discrepancies'] = [];

    const internalMap = new Map<string, PaymentTransactionRecord>();
    for (const rec of internalRecords) {
      if (rec.providerPaymentId) {
        internalMap.set(rec.providerPaymentId, rec);
      }
      if (rec.status === 'SUCCEEDED') {
        totalAmountCollected += Number(rec.amount);
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
          reason: `External transaction ${ext.providerPaymentId} exists in ${provider} but missing in internal database.`,
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

    return {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      provider,
      periodStart,
      periodEnd,
      totalTransactionsCount: internalRecords.length,
      totalAmountCollected: Math.round(totalAmountCollected * 100) / 100,
      totalAmountRefunded: Math.round(totalAmountRefunded * 100) / 100,
      matchedCount,
      discrepancyCount: discrepancies.length,
      discrepancies,
      generatedAt: new Date().toISOString(),
    };
  }
}
