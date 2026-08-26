import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 font-mono font-bold text-2xl">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-100">Page Not Found</h1>
          <p className="text-sm text-slate-400">
            The page you are looking for does not exist, has been removed, or is inaccessible from your current domain context.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Return Home
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full gap-2 text-xs">
              <Home className="w-3.5 h-3.5" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
