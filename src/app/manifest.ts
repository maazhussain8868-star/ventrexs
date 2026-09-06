import { MetadataRoute } from 'next';
import { BRAND } from '@/config/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: `${BRAND.name} — ${BRAND.tagline}`,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    background_color: '#070B14',
    theme_color: '#070B14',
    orientation: 'portrait-primary',
    lang: 'en-US',
    dir: 'ltr',
    categories: ['business', 'productivity'],
    prefer_related_applications: false,
    related_applications: [
      {
        platform: 'play',
        url: 'https://play.google.com/store/apps/details?id=com.ventrexs.app',
        id: 'com.ventrexs.app',
      },
    ],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable' as any,
      },
    ],
    screenshots: [
      {
        src: '/screenshots/mobile-dashboard.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: `${BRAND.name} Mobile Business Operations`,
      },
      {
        src: '/screenshots/mobile-crm.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: `${BRAND.name} Smart CRM & Messaging`,
      },
      {
        src: '/screenshots/desktop-dashboard.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: `${BRAND.name} Desktop Command Center`,
      },
    ],
  };
}
