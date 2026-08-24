import type { Metadata } from 'next';
import { SeoPageLayout, faqJsonLd } from '@/components/seo-page-layout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roastmywebsite.lol';

export const metadata: Metadata = {
  title: 'Website Roast — Free AI Website Roast & Audit',
  description:
    'Get your website roasted for free. A witty, brutally honest AI review that also gives you a real score across SEO, performance, content, UX, and accessibility.',
  alternates: { canonical: `${SITE_URL}/website-roast` },
  openGraph: { title: 'Website Roast — RoastMyWebsite.lol', description: 'Funny first. Actionable always.', url: `${SITE_URL}/website-roast` },
};

const faq = [
  {
    question: 'What is a website roast?',
    answer:
      'A website roast is a witty, pointed critique of your website that\'s grounded in real, measurable problems — slow load times, confusing navigation, missing calls-to-action — rather than generic praise or vague criticism.',
  },
  {
    question: 'Is this just for fun, or is it actually useful?',
    answer:
      'Both. The jokes make the findings memorable and shareable; underneath every joke is a real score and a specific, prioritized fix. Think of the humor as the delivery mechanism for feedback you\'d otherwise skim past.',
  },
  {
    question: 'Can I choose how harsh the roast is?',
    answer:
      'Yes — pick from eight roast personalities, from Brutal and Savage to Friendly, Corporate, Developer, SEO Expert, Gen Z, or Indian Uncle. Same underlying findings, completely different delivery.',
  },
];

export default function WebsiteRoastPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }} />
      <SeoPageLayout
        eyebrow="Website Roast"
        h1="Roast my website — funny first, useful always"
        intro="Paste your URL and get a full website roast: a score out of 100, category breakdowns across SEO, performance, content, UX, and accessibility, and a prioritized list of what to fix — wrapped in a roast you'll actually want to share."
        checklist={[
          'Clear, singular call-to-action above the fold',
          'Navigation with a manageable number of links',
          'Visible contact info and real trust signals (testimonials, reviews)',
          'Substantive homepage copy that explains what you actually do',
          'Fast load time and reasonable page weight',
          'Mobile-friendly responsive layout',
        ]}
        sections={[
          {
            heading: 'How the roast is generated',
            body: (
              <p>
                We fetch your public homepage the way a browser would, extract real signals (word count, CTA count,
                image alt coverage, script weight, and dozens more), score them against sensible, documented
                thresholds, and hand the findings to a roast engine that writes witty, specific lines — never generic
                insults, never invented facts.
              </p>
            ),
          },
          {
            heading: 'We roast the website, not you',
            body: (
              <p>
                Every line targets a decision the website makes — too many buttons, no title tag, a slow server — not
                the person or company behind it. No discriminatory, hateful, or personal content, ever.
              </p>
            ),
          },
          {
            heading: 'Built to be shared',
            body: (
              <p>
                Every result gets a unique URL and a share-ready image card with your score and strongest roast line —
                built for posting, not just reading.
              </p>
            ),
          },
        ]}
        faq={faq}
      />
    </>
  );
}
