import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/']
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/']
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/']
      },
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: ['/api/']
      }
    ],
    sitemap: 'https://fsjest.mizotra.com.com/sitemap.xml',
    host: 'https://fsjest.mizotra.com.com'
  };
}
