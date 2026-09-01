import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Set New Password | Ventrexs AI',
  description: 'Set a new secure password for your Ventrexs AI account.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
