import type { Metadata } from 'next';
import { SeoPageLayout, faqJsonLd } from '@/components/seo-page-layout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roastmywebsite.lol';

export const metadata: Metadata = {
  title: 'Website SEO Checker — Free Instant SEO Check',
  description:
    'Check your website\'s SEO in seconds. A free instant checker for titles, meta descriptions, headings, canonicals, robots.txt, sitemaps, and structured data.',
  alternates: { canonical: `${SITE_URL}/website-seo-checker` },
  openGraph: { title: 'Website SEO Checker — RoastMyWebsite.lol', description: 'Instant, evidence-based SEO checks.', url: `${SITE_URL}/website-seo-checker` },
};

const faq = [
  {
    question: 'How is this different from other free SEO checkers?',
    answer:
      'Most free checkers give you a generic score with no context. This one shows the exact evidence behind every result (the actual title text, the actual status code) and explains why each issue matters, not just that it exists.',
  },
  {
    question: 'Does it check my whole site or just the homepage?',
    answer:
      'The core check analyzes your public homepage, and where technically feasible follows a sample of internal links to check for broken pages. It is not a full-site crawler — for large sites, treat it as a fast first pass, not a replacement for a full crawl.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No. Paste a URL and get results immediately. Anonymous use is limited per minute to keep the tool fast and free for everyone.',
  },
];

export default function WebsiteSeoCheckerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }} />
      <SeoPageLayout
        eyebrow="Website SEO Checker"
        h1="Check your website's SEO in seconds"
        intro="An instant, evidence-based SEO checker: paste a URL and see exactly what's helping and hurting your rankings — with the actual title tag, actual status code, and actual evidence behind every result."
        checklist={[
          'Title and meta description present and correctly sized',
          'One H1, sane heading order beneath it',
          'HTTPS with no unexpected redirect chain',
          'robots.txt allows crawling; sitemap.xml exists',
          'No accidental noindex directive',
          'Canonical tag set on every important page',
        ]}
        sections={[
          {
            heading: 'What the checker looks at',
            body: (
              <p>
                HTTP status and redirects, HTTPS, canonical tags, robots.txt and sitemap presence, indexability via
                meta robots, title and meta description length and presence, heading structure, internal/external
                link counts, a sample of internal links checked for brokenness, structured data, Open Graph tags,
                favicon, the lang attribute, and the mobile viewport tag.
              </p>
            ),
          },
          {
            heading: 'Reading the results',
            body: (
              <p>
                Every check comes with the real evidence we found (e.g. the actual title text or the measured
                response time) so you\'re never taking a black-box score on faith. Each result is also mapped to a
                clear severity — critical, high, medium, or low — so you know what to fix first.
              </p>
            ),
          },
          {
            heading: 'What it won\'t claim to know',
            body: (
              <p>
                Some signals — like full Core Web Vitals field data or a complete crawl of every page — require more
                than a single public fetch. Where we can\'t measure something reliably, the result says so explicitly
                instead of guessing.
              </p>
            ),
          },
        ]}
        faq={faq}
      />
    </>
  );
}
