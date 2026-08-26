import { Lead } from '@/types';

export interface LeadScoreBreakdown {
  totalScore: number;
  grade: 'HOT' | 'WARM' | 'COLD';
  breakdown: {
    contactCompleteness: number; // Max 30
    estimatedValue: number;      // Max 25
    sourceIntent: number;        // Max 20
    priorityUrgency: number;     // Max 15
    engagement: number;          // Max 10
  };
  reasons: string[];
}

/**
 * Calculates a deterministic, transparent lead quality score (0–100).
 * Modular rule-based algorithm designed for service businesses with AI expansion hooks.
 */
export function calculateLeadScore(lead: Partial<Lead>): LeadScoreBreakdown {
  let contactCompleteness = 0;
  let estimatedValueScore = 0;
  let sourceIntent = 0;
  let priorityUrgency = 0;
  let engagement = 0;
  const reasons: string[] = [];

  // 1. Contact Completeness (Max 30)
  if (lead.name && lead.name.trim().length > 1) {
    contactCompleteness += 5;
  }
  if (lead.phone && lead.phone.replace(/\D/g, '').length >= 10) {
    contactCompleteness += 12;
    reasons.push('Verified phone number provided');
  }
  if (lead.email && lead.email.includes('@') && lead.email.includes('.')) {
    contactCompleteness += 10;
    reasons.push('Direct email contact available');
  }
  if (lead.company && lead.company.trim().length > 0) {
    contactCompleteness += 3;
  }
  contactCompleteness = Math.min(contactCompleteness, 30);

  // 2. Estimated Deal Value (Max 25)
  const value = Number(lead.estimatedValue) || 0;
  if (value >= 5000) {
    estimatedValueScore = 25;
    reasons.push('High contract value ($5k+)');
  } else if (value >= 2500) {
    estimatedValueScore = 20;
    reasons.push('Substantial contract value ($2.5k–$5k)');
  } else if (value >= 1000) {
    estimatedValueScore = 15;
    reasons.push('Standard commercial value ($1k–$2.5k)');
  } else if (value >= 500) {
    estimatedValueScore = 10;
  } else if (value > 0) {
    estimatedValueScore = 5;
  }

  // 3. Source Intent (Max 20)
  const source = lead.source || 'Website';
  switch (source) {
    case 'Referral':
      sourceIntent = 20;
      reasons.push('High-trust customer referral');
      break;
    case 'Phone Call':
      sourceIntent = 18;
      reasons.push('Inbound direct call (high purchase intent)');
      break;
    case 'Website':
    case 'Direct':
      sourceIntent = 15;
      reasons.push('Direct website inquiry');
      break;
    case 'Google':
    case 'Angi':
    case 'Thumbtack':
      sourceIntent = 14;
      reasons.push('Active search intent marketplace');
      break;
    case 'Yelp':
    case 'Facebook':
    case 'Instagram':
      sourceIntent = 10;
      break;
    default:
      sourceIntent = 8;
  }

  // 4. Priority & Urgency (Max 15)
  const priority = lead.priority || 'medium';
  switch (priority) {
    case 'urgent':
      priorityUrgency = 15;
      reasons.push('Urgent / Emergency service requirement');
      break;
    case 'high':
      priorityUrgency = 12;
      reasons.push('High service priority');
      break;
    case 'medium':
      priorityUrgency = 8;
      break;
    case 'low':
      priorityUrgency = 4;
      break;
  }

  // 5. Engagement & Activity (Max 10)
  const activityCount = lead.activities?.length || 0;
  const notesCount = lead.notesList?.length || 0;
  const totalTouchpoints = activityCount + notesCount;

  if (totalTouchpoints >= 4) {
    engagement = 10;
    reasons.push('Extensive customer touchpoint history');
  } else if (totalTouchpoints >= 2) {
    engagement = 7;
    reasons.push('Active ongoing communications');
  } else if (totalTouchpoints >= 1) {
    engagement = 4;
  }

  const totalScore = Math.min(
    100,
    Math.max(0, contactCompleteness + estimatedValueScore + sourceIntent + priorityUrgency + engagement)
  );

  let grade: 'HOT' | 'WARM' | 'COLD' = 'COLD';
  if (totalScore >= 75) {
    grade = 'HOT';
  } else if (totalScore >= 45) {
    grade = 'WARM';
  }

  return {
    totalScore,
    grade,
    breakdown: {
      contactCompleteness,
      estimatedValue: estimatedValueScore,
      sourceIntent,
      priorityUrgency,
      engagement,
    },
    reasons,
  };
}
