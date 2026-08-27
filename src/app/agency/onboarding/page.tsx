'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgencyOnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/agency?tab=onboarding');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-xs font-mono text-slate-400">
      Loading Agency Onboarding Pipeline...
    </div>
  );
}
