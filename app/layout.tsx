import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'InsuraCore — Enterprise Insurance Claim Platform',
    template: '%s | InsuraCore',
  },
  description:
    'InsuraCore is a modern, enterprise-grade insurance claim management platform. Purchase policies, file claims, track settlements, and manage your entire insurance lifecycle.',
  keywords: ['insurance', 'claims', 'policy management', 'SaaS', 'enterprise'],
  authors: [{ name: 'InsuraCore' }],
  openGraph: {
    title: 'InsuraCore — Enterprise Insurance Claim Platform',
    description: 'Digitize and automate your complete insurance claim lifecycle.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased bg-[var(--color-base-950)] text-[var(--color-base-200)] transition-colors duration-200">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
