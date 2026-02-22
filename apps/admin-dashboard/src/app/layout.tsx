import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Velanova Admin Dashboard',
  description: 'Admin portal for Velanova management',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
