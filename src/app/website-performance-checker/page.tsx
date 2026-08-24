import type { Metadata } from 'next';
import { SeoPageLayout, faqJsonLd } from '@/components/seo-page-layout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://roastmywebsite.lol';

export const metadata: Metadata = {
  title: 'Website Performance Checker — Free Speed & Core Web Vitals Check',
  description:
    'Check your website\'s performance for free: page weight, render-blocking resources, JavaScript bloat, server response time, and Core Web Vitals where available.',
  alternates: { canonical: `${SITE_URL}/website-performance-checker` },
  openGraph: {
    title: 'Website Performance Checker — RoastMyWebsite.lol',
    description: 'Real performance signals, not vague speed advice.',
    url: `${SITE_URL}/website-performance-checker`,
  },
};

const faq = [
  {
    question: 'Do you show real Core Web Vitals (LCP, CLS, INP)?',
    answer:
      'When a PageSpeed Insights API key is configured on the server, yes — real field or lab data. Without one, Core Web Vitals are explicitly marked "Not available" rather than estimated, since guessing performance numbers would be actively misleading.',
  },
  {
    question: 'What performance signals are always measured?',
    answer:
      'Regardless of API configuration, we always measure the raw HTML page weight, server response time, the number of render-blocking script/stylesheet tags, script and inline CSS volume, image count, and whether caching headers are set.',
  },
  {
    question: 'Why does performance matter for SEO too?',
    answer:
      'Core Web Vitals are a confirmed Google ranking signal, and slow pages independently increase bounce rate — so performance affects both whether you rank and whether visitors stay once they arrive.',
  },
];

export default function WebsitePerformanceCheckerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }} />
      <SeoPageLayout
        eyebrow="Website Performance Checker"
        h1="Website performance checker: speed signals that actually matter"
        intro="Page weight, render-blocking resources, JavaScript bloat, server response time, and Core Web Vitals where available — measured, not estimated."
        checklist={[
          'HTML document size kept lean',
          'Few render-blocking scripts/stylesheets in <head>',
          'JavaScript and CSS trimmed of unused weight',
          'Server responds quickly (low time-to-first-byte)',
          'Caching headers set for repeat visits',
          'Images compressed, modern formats, lazy-loaded below the fold',
        ]}
        sections={[
          {
            heading: 'What we measure directly',
            body: (
              <p>
                Every check fetches your homepage the way a browser would and measures real signals: response time,
                transferred page size, the number of render-blocking script and stylesheet tags, approximate
                inline JavaScript and CSS volume, image count, and the presence of caching headers like Cache-Control
                and ETag.
              </p>
            ),
          },
          {
            heading: 'Core Web Vitals, honestly',
            body: (
              <p>
                LCP, CLS, and INP require either real user field data or a full browser-based Lighthouse run — a
                single server-side fetch can\'t produce them reliably. When a PageSpeed Insights API key is
                configured, we pull real data; otherwise the result says "Not available" so you\'re never shown a
                fabricated number.
              </p>
            ),
          },
          {
            heading: 'Fixing what we find',
            body: (
              <p>
                Each performance finding comes with a specific fix — compress this, defer that, enable caching here —
                prioritized by how much it\'s actually likely to help, not just alphabetically.
              </p>
            ),
          },
        ]}
        faq={faq}
      />
    </>
  );
}
