import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roastmywebsite.lol';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RoastMyWebsite.lol — Your website deserves better',
    template: '%s · RoastMyWebsite.lol',
  },
  description:
    "Enter your URL. We'll roast your website, find what's broken, and tell you what to fix first. Free AI website roast, SEO audit, and UX review.",
  openGraph: {
    title: 'RoastMyWebsite.lol',
    description: "We'll roast your website, find what's broken, and tell you what to fix first.",
    url: SITE_URL,
    siteName: 'RoastMyWebsite.lol',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoastMyWebsite.lol',
    description: "We'll roast your website, find what's broken, and tell you what to fix first.",
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen grain-overlay">
        <div className="relative flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
