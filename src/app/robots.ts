import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/login', '/signup'],
        disallow: ['/dashboard', '/invoices', '/customers', '/collections', '/copilot', '/follow-up', '/reports', '/settings', '/admin', '/notifications'],
      },
    ],
    sitemap: 'https://paypilot.ai/sitemap.xml',
  };
}
