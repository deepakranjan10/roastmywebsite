import type { Metadata } from 'next';
import { SeoPageLayout, faqJsonLd } from '@/components/seo-page-layout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://roastmywebsite.lol';

export const metadata: Metadata = {
  title: 'Technical SEO Checker — Free Crawlability & Indexability Check',
  description:
    'A free technical SEO checker for crawlability and indexability: HTTPS, redirects, canonicals, robots.txt, sitemaps, noindex tags, structured data, and more.',
  alternates: { canonical: `${SITE_URL}/technical-seo-checker` },
  openGraph: {
    title: 'Technical SEO Checker — RoastMyWebsite.lol',
    description: 'Crawlability and indexability, checked in seconds.',
    url: `${SITE_URL}/technical-seo-checker`,
  },
};

const faq = [
  {
    question: 'What counts as "technical" SEO here, specifically?',
    answer:
      'Everything that determines whether a search engine can access, understand, and correctly index your page — HTTP status, HTTPS, redirects, canonical tags, robots.txt, sitemap presence, meta robots/noindex, heading structure, structured data, and related on-page mechanics.',
  },
  {
    question: 'Why does technical SEO matter more than content sometimes?',
    answer:
      'Great content on a page a crawler can\'t reach or has been told not to index will never rank, no matter how good it is. Technical SEO is the prerequisite layer everything else depends on.',
  },
  {
    question: 'Will this catch a noindex tag I forgot to remove after launch?',
    answer:
      'Yes — accidental noindex tags are one of the most common and most damaging technical SEO mistakes, and it\'s flagged as a critical-severity finding whenever detected.',
  },
];

export default function TechnicalSeoCheckerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }} />
      <SeoPageLayout
        eyebrow="Technical SEO Checker"
        h1="Technical SEO checker: crawlability and indexability, fast"
        intro="Before rankings, before content, before anything else — can a search engine actually reach, read, and index this page? This checker verifies the technical foundation first."
        checklist={[
          'Homepage returns a 200 status over HTTPS',
          'No accidental noindex or overly aggressive robots.txt block',
          'Canonical tag present and self-referencing',
          'Sitemap.xml exists and robots.txt points to it',
          'Heading hierarchy is clean, with exactly one H1',
          'Structured data present where relevant (Organization, Product, FAQ, etc.)',
        ]}
        sections={[
          {
            heading: 'Crawlability vs. indexability',
            body: (
              <p>
                Crawlability is whether a bot can physically reach and download your page (status codes, robots.txt,
                redirects). Indexability is whether it\'s allowed to be shown in search results once crawled (meta
                robots, noindex, canonicalization). This checker verifies both, since a failure in either one is
                enough to keep a page out of search results entirely.
              </p>
            ),
          },
          {
            heading: 'Common technical SEO failures we catch',
            body: (
              <p>
                Missing or misconfigured canonical tags causing duplicate-content confusion, redirect chains that
                waste crawl budget, missing robots.txt or sitemap files, broken heading hierarchies, and pages
                accidentally left in noindex after a staging-to-production migration.
              </p>
            ),
          },
          {
            heading: 'What comes after the checker',
            body: (
              <p>
                Every technical finding includes the exact evidence observed and a specific fix, so you can hand the
                list directly to a developer without translating it first.
              </p>
            ),
          },
        ]}
        faq={faq}
      />
    </>
  );
}
