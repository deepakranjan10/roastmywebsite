import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roastmywebsite.lol';

const STATIC_ROUTES = [
  '',
  '/leaderboard',
  '/seo-roast',
  '/website-roast',
  '/website-seo-checker',
  '/website-audit',
  '/technical-seo-checker',
  '/website-performance-checker',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));
}
