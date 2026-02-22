import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SessionProvider } from '@/components/SessionProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://velanova.app'),
  title: {
    default: 'Velanova - Bring AI to Your Legacy Software',
    template: '%s | Velanova',
  },
  description:
    'Connect your databases and enterprise systems to 67+ AI models. One unified interface for ChatGPT, Claude, Gemini, and more. BYOK supported.',
  keywords: [
    'AI adoption',
    'enterprise AI',
    'AI governance',
    'legacy software AI',
    'database AI integration',
    'ChatGPT enterprise',
    'Claude enterprise',
    'Gemini enterprise',
    'AI model aggregator',
    'BYOK AI',
    'bring your own key',
    'MCP server',
    'model context protocol',
    'AI desktop app',
    'enterprise AI platform',
    'AI cost tracking',
    'multi-model AI',
    'Velanova',
  ],
  authors: [{ name: 'Nexolve Technologies' }],
  creator: 'Nexolve Technologies',
  publisher: 'Nexolve Technologies',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://velanova.app',
    siteName: 'Velanova',
    title: 'Velanova - Bring AI to Your Legacy Software',
    description:
      'Connect your databases and enterprise systems to 67+ AI models. One unified interface for all your AI needs.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Velanova - AI Adoption & Governance Engine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Velanova - Bring AI to Your Legacy Software',
    description:
      'Connect your databases and enterprise systems to 67+ AI models. One unified interface for all your AI needs.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add when available:
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
