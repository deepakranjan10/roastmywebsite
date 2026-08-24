import type { Metadata } from 'next';
import { SeoPageLayout, faqJsonLd } from '@/components/seo-page-layout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://roastmywebsite.lol';

export const metadata: Metadata = {
  title: 'SEO Roast — Get Your Website\'s SEO Roasted (Free)',
  description:
    'A free SEO roast that finds real technical SEO problems — missing titles, broken canonicals, thin content — and turns them into a brutally funny, genuinely useful audit.',
  alternates: { canonical: `${SITE_URL}/seo-roast` },
  openGraph: { title: 'SEO Roast — RoastMyWebsite.lol', description: 'Real SEO problems, roasted into something worth reading.', url: `${SITE_URL}/seo-roast` },
};

const faq = [
  {
    question: 'Is an SEO roast the same as a real SEO audit?',
    answer:
      'The underlying analysis is a real technical SEO audit — title tags, meta descriptions, headings, canonicals, robots.txt, sitemaps, structured data, and more. The "roast" is just how we deliver the findings: funny and memorable instead of a wall of gray dashboard text.',
  },
  {
    question: 'Will it make up problems just to be funny?',
    answer:
      'No. Every joke is generated from a specific, measured signal on your page. If something can\'t be measured (like Core Web Vitals without a PageSpeed API key), it\'s labeled "Not available," never guessed.',
  },
  {
    question: 'Does the roast affect my actual SEO?',
    answer: 'No — this is a read-only analysis. We fetch your public homepage the same way a browser or crawler would; nothing is changed on your site.',
  },
];

export default function SeoRoastPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }} />
      <SeoPageLayout
        eyebrow="SEO Roast"
        h1="Get your SEO roasted, not just reported"
        intro="Most SEO tools hand you a 40-tab spreadsheet and expect you to care. We find the same real technical SEO problems and tell you about them in a way you'll actually remember — and actually fix."
        checklist={[
          'Title tag present, unique, and under 60 characters',
          'Meta description present and 140–160 characters',
          'Exactly one clear H1, with a sane heading order after it',
          'robots.txt and an XML sitemap both exist',
          'Canonical tag set, HTTPS enforced, no noindex left on by accident',
          'Structured data (JSON-LD) and Open Graph tags present',
        ]}
        sections={[
          {
            heading: 'Why "roast" your SEO instead of just reporting it',
            body: (
              <p>
                Technical SEO reports are famously easy to generate and famously easy to ignore. Turning each finding
                into a specific, pointed observation about your actual page — not generic advice — makes the problem
                land, and makes it more likely you actually go fix the missing title tag instead of closing the tab.
              </p>
            ),
          },
          {
            heading: 'What we actually check',
            body: (
              <p>
                HTTP status and HTTPS, redirect chains, canonical tags, robots.txt and sitemap presence, indexability
                (meta robots), title and meta description quality, heading structure and duplicate headings, internal
                and external link counts, sampled broken internal links, structured data, Open Graph tags, favicon,
                the HTML lang attribute, and the mobile viewport tag. Anything we can&apos;t measure from a public,
                unauthenticated fetch is explicitly marked as not available — we don&apos;t fill gaps with guesses.
              </p>
            ),
          },
          {
            heading: 'From roast to fix',
            body: (
              <p>
                Every joke in your roast links back to a specific finding with a plain-English explanation of why it
                matters and exactly what to change. The comedy is the hook; the fix list is the point.
              </p>
            ),
          },
        ]}
        faq={faq}
      />
    </>
  );
}
