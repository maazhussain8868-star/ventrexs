import { redirect } from 'next/navigation';
import { DemoAccessService } from '@/lib/demo-access/service';

export default async function DemoGatewayEntryPage() {
  // Server-side retrieval of the active 24h demo token
  const tokenRecord = DemoAccessService.getActiveDemoToken('biz_01');
  if (tokenRecord?.rawToken) {
    redirect(`/demo/${tokenRecord.rawToken}`);
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Live Demo Unavailable</h1>
        <p className="text-xs text-on-surface-variant">
          Live demo invitations are currently closed or under maintenance. Please contact sales for private evaluation access.
        </p>
        <a href="/contact" className="inline-block px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold">
          Contact Enterprise Sales
        </a>
      </div>
    </div>
  );
}
