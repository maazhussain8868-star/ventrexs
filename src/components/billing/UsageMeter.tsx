'use client';

import React from 'react';
import { 
  Bot, 
  MessageSquare, 
  Mail, 
  PhoneCall, 
  Wrench, 
  FileText, 
  Star, 
  Users,
  AlertTriangle 
} from 'lucide-react';
import { UsageMetric } from '@/types';

interface UsageMeterProps {
  metric: UsageMetric;
  label: string;
  current: number;
  limit: number;
  isUnlimited?: boolean;
  unit?: string;
  showWarning?: boolean;
}

export function UsageMeter({
  metric,
  label,
  current,
  limit,
  isUnlimited = false,
  unit = '',
  showWarning = true,
}: UsageMeterProps) {
  const getMetricIcon = () => {
    switch (metric) {
      case 'ai_receptionist_minutes':
      case 'ai_receptionist_chats':
        return <Bot className="w-4 h-4 text-primary" />;
      case 'sms_messages':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'email_messages':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'whatsapp_messages':
        return <PhoneCall className="w-4 h-4 text-green-600" />;
      case 'jobs_created':
        return <Wrench className="w-4 h-4 text-amber-500" />;
      case 'estimates_created':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'review_requests_sent':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'team_members_count':
        return <Users className="w-4 h-4 text-indigo-500" />;
      default:
        return <FileText className="w-4 h-4 text-on-surface-variant" />;
    }
  };

  const percent = isUnlimited ? 0 : Math.min(100, Math.round((current / limit) * 100));
  const isNearLimit = !isUnlimited && percent >= 80;
  const isOverLimit = !isUnlimited && current >= limit;

  const getProgressColor = () => {
    if (isOverLimit) return 'bg-error';
    if (isNearLimit) return 'bg-amber-500';
    return 'bg-primary';
  };

  return (
    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:border-outline-variant transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-surface-container-high">
            {getMetricIcon()}
          </div>
          <span className="text-xs font-semibold text-on-surface">{label}</span>
        </div>
        <div className="text-xs font-mono font-bold text-on-surface">
          {isUnlimited ? (
            <span className="text-tertiary font-sans bg-tertiary/10 px-2 py-0.5 rounded-full text-[11px]">
              Unlimited
            </span>
          ) : (
            <span>
              {current.toLocaleString()} / {limit.toLocaleString()} {unit}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {!isUnlimited && (
        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-1">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-1 text-[11px] text-on-surface-variant">
        <span>{isUnlimited ? 'Active unlimited quota' : `${percent}% utilized`}</span>
        {isOverLimit && showWarning && (
          <span className="text-error font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Limit reached
          </span>
        )}
        {isNearLimit && !isOverLimit && showWarning && (
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            Approaching limit
          </span>
        )}
      </div>
    </div>
  );
}
