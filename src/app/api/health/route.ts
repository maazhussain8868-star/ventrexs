import { NextResponse } from 'next/server';
import { HealthService } from '@/lib/health/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const metrics = HealthService.getSystemHealthMetrics();
  const allHealthy = metrics.every((m) => m.status === 'HEALTHY');

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      metrics,
    },
    {
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
