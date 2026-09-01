import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Ventrexs AI',
  description: 'Sign in to your Ventrexs AI contractor operations workspace.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
