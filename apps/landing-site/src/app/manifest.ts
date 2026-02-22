import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Velanova - AI Adoption & Governance Engine',
    short_name: 'Velanova',
    description:
      'Connect your databases and enterprise systems to 67+ AI models. One unified interface for all your AI needs.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { src: '/logo.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
