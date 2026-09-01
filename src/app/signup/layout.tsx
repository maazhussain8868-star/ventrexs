import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Ventrexs AI',
  description: 'Create your Ventrexs AI contractor operations workspace.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
