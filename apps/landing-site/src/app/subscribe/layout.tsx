import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscribe',
  description:
    'Subscribe to Velanova. Choose your plan and start connecting your databases to AI today.',
};

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
