import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workspace Onboarding | Ventrexs AI',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
