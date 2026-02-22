import type { MetadataRoute } from 'next';

const BASE_URL = 'https://velanova.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: '/pricing', changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: '/download', changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: '/docs', changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: '/integrations', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: '/demo', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/contact', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/subscribe', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: '/refund', changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: '/cookies', changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  return staticPages.map(page => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
