import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Ventrexs AI',
  description: 'Reset your Ventrexs AI account password securely.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
