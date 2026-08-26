import { MetadataRoute } from 'next';
import { BRAND } from '@/config/brand';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/features', '/about', '/security', '/contact', '/privacy', '/terms', '/demo'],
        disallow: [
          '/dashboard',
          '/leads',
          '/pipeline',
          '/jobs',
          '/invoices',
          '/customers',
          '/collections',
          '/copilot',
          '/follow-up',
          '/reports',
          '/settings',
          '/admin',
          '/agency',
          '/notifications',
        ],
      },
    ],
    sitemap: `${BRAND.domain}/sitemap.xml`,
  };
}
