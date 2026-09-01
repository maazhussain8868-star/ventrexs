import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Ventrexs AI',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
