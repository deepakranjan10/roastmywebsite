import type { Metadata } from 'next';
import { SeoPageLayout, faqJsonLd } from '@/components/seo-page-layout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roastmywebsite.lol';

export const metadata: Metadata = {
  title: 'Website Audit — Free Full Website Audit (SEO, UX, Performance)',
  description:
    'A free, full website audit covering technical SEO, performance, content, UX, conversion, and accessibility — scored, prioritized, and explained in plain English.',
  alternates: { canonical: `${SITE_URL}/website-audit` },
  openGraph: { title: 'Website Audit — RoastMyWebsite.lol', description: 'One audit, six categories, a real fix list.', url: `${SITE_URL}/website-audit` },
};

const faq = [
  {
    question: 'What does a full website audit cover here?',
    answer:
      'Six weighted categories: Technical SEO, Performance, Content, UX, Conversion, and Accessibility. Each has its own 0–100 score, a list of real findings, what\'s already working, and prioritized fixes.',
  },
  {
    question: 'How is the overall score calculated?',
    answer:
      'It\'s a weighted average, not a blind mean — Technical SEO and Performance count for more because if a page can\'t be crawled or loads too slowly, nothing else matters as much. The exact weights are documented in the scoring code.',
  },
  {
    question: 'Can I audit a competitor\'s site?',
    answer:
      'Yes, for any publicly accessible URL — this only reads what a normal visitor or search engine could already see, the same way any SEO tool does. There is no login-gated or private-network access.',
  },
];

export default function WebsiteAuditPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }} />
      <SeoPageLayout
        eyebrow="Website Audit"
        h1="A full website audit, not just an SEO score"
        intro="Technical SEO, performance, content quality, UX, conversion friction, and accessibility — one audit, six real scores, and a prioritized punch list of what to fix first."
        checklist={[
          'Technical SEO: crawlability, indexability, on-page basics',
          'Performance: page weight, render-blocking resources, response time',
          'Content: depth, clarity, and a clear value proposition',
          'UX: navigation complexity, trust signals, mobile-friendliness',
          'Conversion: CTA clarity, forms, friction',
          'Accessibility: alt text, labels, semantic markup',
        ]}
        sections={[
          {
            heading: 'Why six categories instead of one score',
            body: (
              <p>
                A single number hides where the actual problem is. Splitting the audit into six weighted categories
                means you can see immediately whether your site is slow, unclear, hard to navigate, or all three —
                and fix the highest-leverage one first.
              </p>
            ),
          },
          {
            heading: 'Every finding has evidence',
            body: (
              <p>
                Each issue in the audit includes the problem, why it matters, the specific evidence we measured, and
                a recommended fix — so nothing in the report is a vague "improve your SEO" instruction.
              </p>
            ),
          },
          {
            heading: 'From audit to action',
            body: (
              <p>
                Findings are grouped into Critical, High, Medium, and Low priority so you always know what to tackle
                first, whether that\'s a missing title tag or a page that loads so slowly visitors bounce before it
                finishes.
              </p>
            ),
          },
        ]}
        faq={faq}
      />
    </>
  );
}
