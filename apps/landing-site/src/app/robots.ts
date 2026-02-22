import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/subscribe/checkout', '/subscribe/success'],
      },
    ],
    sitemap: 'https://velanova.app/sitemap.xml',
  };
}
