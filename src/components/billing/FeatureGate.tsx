'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FeatureGateProps {
  feature: 'multiUser' | 'whatsapp' | 'advancedReports' | 'apiAccess' | 'aiReceptionist' | 'reputation';
  requiredPlan?: 'Professional' | 'Enterprise';
  title?: string;
  description?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function FeatureGate({
  feature,
  requiredPlan = 'Professional',
  title,
  description,
  fallback,
  children,
}: FeatureGateProps) {
  const { checkEntitlement, subscription } = useApp();
  const hasAccess = checkEntitlement(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const defaultTitle = title || `Upgrade to ${requiredPlan} to unlock this feature`;
  const defaultDesc =
    description ||
    `This premium feature requires a ${requiredPlan} or higher SaaS subscription. Upgrade your workspace to supercharge your field service operations.`;

  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-surface-container-lowest via-surface-container to-surface-container-high border border-outline-variant/80 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-sm my-6">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 ring-8 ring-primary/5">
        <Lock className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-bold text-on-surface mb-2">{defaultTitle}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">
        {defaultDesc}
      </p>

      <div className="flex items-center gap-3">
        <Link href="/settings/billing">
          <Button variant="primary" className="gap-2 shadow-xs">
            <Sparkles className="w-4 h-4" />
            Upgrade to {requiredPlan}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <p className="text-[11px] text-on-surface-variant mt-4 font-medium">
        Current tier: <span className="font-bold text-on-surface">{subscription.plan}</span> ({subscription.status})
      </p>
    </div>
  );
}
