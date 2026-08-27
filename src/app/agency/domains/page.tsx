'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgencyDomainsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/agency?tab=domains');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-xs font-mono text-slate-400">
      Loading Custom Domain Center...
    </div>
  );
}
