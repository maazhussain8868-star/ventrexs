import { MetadataRoute } from 'next';
import { BRAND } from '@/config/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — ${BRAND.tagline}`,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#070B14',
    theme_color: '#070B14',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
