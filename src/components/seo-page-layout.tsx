import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export interface SeoSection {
  heading: string;
  body: React.ReactNode;
}

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export function SeoPageLayout({
  eyebrow,
  h1,
  intro,
  checklist,
  sections,
  faq,
}: {
  eyebrow: string;
  h1: string;
  intro: string;
  checklist?: string[];
  sections: SeoSection[];
  faq: SeoFaqItem[];
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-flame-500">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{h1}</h1>
          <p className="mt-4 text-lg text-white/60">{intro}</p>

          <div className="mt-8">
            <Link
              href="/#roast-form"
              className="inline-block rounded-xl bg-flame-gradient px-6 py-3.5 font-display font-bold text-white shadow-lg shadow-flame-600/30 transition hover:brightness-110"
            >
              Try it free — ROAST MY WEBSITE 🔥
            </Link>
          </div>

          {checklist && checklist.length > 0 && (
            <div className="card-surface mt-10 rounded-2xl p-6">
              <h2 className="font-display text-lg font-bold">Quick checklist</h2>
              <ul className="mt-3 space-y-2">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="mt-0.5 text-acid-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 space-y-10">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="font-display text-xl font-bold">{s.heading}</h2>
                <div className="mt-2 space-y-3 text-white/65 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>

          {faq.length > 0 && (
            <div className="mt-14">
              <h2 className="font-display text-xl font-bold">FAQ</h2>
              <div className="mt-4 space-y-4">
                {faq.map((f) => (
                  <div key={f.question} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="font-semibold text-white/90">{f.question}</div>
                    <div className="mt-1.5 text-sm text-white/60">{f.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export function faqJsonLd(faq: SeoFaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
