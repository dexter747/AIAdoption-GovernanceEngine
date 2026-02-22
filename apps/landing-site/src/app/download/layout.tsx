import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download',
  description:
    'Download Velanova for Windows, macOS, or Linux. Connect your databases to AI in minutes with our free desktop application.',
};

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
