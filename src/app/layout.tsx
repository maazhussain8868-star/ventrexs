import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ToastContainer } from '@/components/ui/Toast';

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'PayPilot AI — Halal-First Accounts Receivable & Collection Copilot',
    template: '%s | PayPilot AI',
  },
  description:
    'Automate polite, truthful invoice reminders, maintain financial ledger integrity, and accelerate cash flow without interest, late penalties, or debt financing.',
  keywords: [
    'accounts receivable',
    'invoice reminders',
    'cash flow automation',
    'halal fintech',
    'zero interest billing',
    'collection copilot',
    'ethical receivables',
  ],
  authors: [{ name: 'PayPilot AI' }],
  metadataBase: new URL('https://paypilot.ai'),
  openGraph: {
    title: 'PayPilot AI — Ethical Accounts Receivable & Collections Copilot',
    description:
      'Human-in-the-loop AI reminders for SMB accounts receivable with verified ledger balance enforcement and multi-channel delivery.',
    url: 'https://paypilot.ai',
    siteName: 'PayPilot AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PayPilot AI — Ethical Accounts Receivable Copilot',
    description:
      'Human-in-the-loop AI reminders for SMB accounts receivable with verified ledger balance enforcement.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background antialiased min-h-screen">
        <AppProvider>
          {children}
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
