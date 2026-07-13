import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'Velanova documentation, guides, and API reference. Learn how to connect databases, configure AI providers, and get the most out of the platform.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
