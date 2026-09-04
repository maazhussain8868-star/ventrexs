'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * SubscriptionGuard
 * Client-side layout & route guard component that blocks access for unpaid users.
 * Automatically respects NEXT_PUBLIC_ENABLE_PAYWALL toggle for seamless local testing.
 */
export function SubscriptionGuard({ children, fallback }: SubscriptionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { subscription, user, isLoading } = useApp();

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const isPaywallEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYWALL !== 'false';

  const isTrialValid =
    subscription?.status === 'trialing' &&
    Boolean(
      subscription?.currentPeriodEnd &&
      new Date(subscription.currentPeriodEnd).getTime() > Date.now()
    );

  const hasActiveSubscription =
    !isPaywallEnabled ||
    isDemoMode ||
    subscription?.status === 'active' ||
    Boolean(isTrialValid);

  useEffect(() => {
    if (!isLoading && user && !hasActiveSubscription) {
      const reason = subscription?.status === 'trialing' ? 'trial_expired' : 'paywall';
      router.push(`/pricing?reason=${reason}&from=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, hasActiveSubscription, subscription?.status, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!hasActiveSubscription) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-lg text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-on-surface">Subscription Required</h2>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Access to your business tools and AI triage receptionist requires an active plan subscription.
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push(`/pricing?from=${encodeURIComponent(pathname)}`)}
            className="w-full font-bold gap-2 text-xs"
          >
            <span>Choose a Plan</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
