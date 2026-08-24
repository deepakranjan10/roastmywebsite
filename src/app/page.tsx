import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { RoastForm } from '@/components/roast-form';
import { ExampleRoastCard } from '@/components/example-roast-card';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://roastmywebsite.lol';

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RoastMyWebsite.lol',
  url: SITE_URL,
  description: "Enter your URL. We'll roast your website, find what's broken, and tell you what to fix first.",
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/roast/{search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-grid-fade" />
          <div className="mx-auto max-w-5xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-acid-500" />
              Free. No signup. Emotional damage guaranteed.
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Your website deserves better.
              <br />
              Unfortunately, we&apos;re going to{' '}
              <span className="text-gradient-flame">tell you why</span>.
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-white/60">
              Enter your URL. We&apos;ll roast your website, find what&apos;s broken, and tell you what to fix first.
            </p>

            <div className="mx-auto mt-10 max-w-2xl">
              <RoastForm />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-bold text-white/90 sm:text-3xl">Here&apos;s what a roast looks like</h2>
            <p className="mt-2 text-white/50">Funny first. Actionable always.</p>
          </div>
          <div className="mx-auto max-w-xl">
            <ExampleRoastCard />
          </div>
        </section>

        <section className="border-t border-white/5 bg-ink-900/40 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-3">
              <FeatureCard
                emoji="🔥"
                title="Funny, not mean"
                body="We roast the website, never the person. Clever beats cruel, every time."
              />
              <FeatureCard
                emoji="🕵️"
                title="Never invents findings"
                body="Every joke is backed by a real, measured signal. Nothing here is guessed."
              />
              <FeatureCard
                emoji="🛠️"
                title="Actually fixable"
                body="A prioritized, plain-English list of what to fix first — not a wall of jargon."
              />
            </div>
          </div>
        </section>

        <section className="py-20 text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Think your website can survive?</h2>
          <p className="mt-2 text-white/50">Find out in about 15 seconds.</p>
          <Link
            href="#roast-form"
            className="mt-6 inline-block rounded-xl bg-flame-gradient px-6 py-3.5 font-display font-bold text-white shadow-lg shadow-flame-600/30 transition hover:brightness-110"
          >
            ROAST MY WEBSITE 🔥
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function FeatureCard({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="text-3xl">{emoji}</div>
      <h3 className="mt-3 font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-white/50">{body}</p>
    </div>
  );
}
