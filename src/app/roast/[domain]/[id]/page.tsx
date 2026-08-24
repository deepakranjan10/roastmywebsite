import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAuditById } from '@/lib/store';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ScoreRing } from '@/components/score-ring';
import { CategoryCard } from '@/components/category-card';
import { FindingList } from '@/components/finding-list';
import { ShareButtons } from '@/components/share-buttons';
import { PERSONALITY_LABELS } from '@/types/audit';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roastmywebsite.lol';

interface Props {
  params: { domain: string; id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const audit = await getAuditById(params.id);
  if (!audit) return { title: 'Roast not found' };

  const title = `${audit.domain} scored ${audit.overallScore}/100 — RoastMyWebsite.lol`;
  const description = audit.roast.lines[0]?.text ?? audit.roast.headline;
  const ogImage = `${SITE_URL}/api/og/${audit.id}`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/roast/${audit.domain}/${audit.id}` },
    openGraph: { title, description, images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function ResultPage({ params }: Props) {
  const audit = await getAuditById(params.id);
  if (!audit || audit.domain !== params.domain) notFound();

  const shareUrl = `${SITE_URL}/roast/${audit.domain}/${audit.id}`;
  const ogImageUrl = `${SITE_URL}/api/og/${audit.id}`;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
              {audit.domain} has been roasted 🔥
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
              Your website has been <span className="text-gradient-flame">roasted</span>
            </h1>
          </div>

          <div className="mt-10 flex flex-col items-center gap-8 sm:flex-row sm:items-stretch sm:justify-center">
            {audit.screenshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={audit.screenshotUrl}
                alt={`Screenshot of ${audit.domain}`}
                className="h-64 w-full max-w-sm rounded-2xl border border-white/10 object-cover object-top shadow-2xl sm:w-72"
              />
            ) : (
              <div className="flex h-64 w-full max-w-sm items-center justify-center rounded-2xl border border-white/10 bg-ink-800 text-center text-sm text-white/30 sm:w-72">
                Screenshot not configured
                <br />
                (set SCREENSHOT_SERVICE_URL)
              </div>
            )}

            <div className="card-surface flex flex-col items-center justify-center rounded-2xl px-8 py-8">
              <ScoreRing score={audit.overallScore} size={168} strokeWidth={12} />
              <div className="mt-3 text-center">
                <div className="font-display text-lg font-bold">{audit.overallStatus}</div>
                <div className="text-sm text-white/50">&ldquo;{audit.overallVerdict}&rdquo;</div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {audit.categories.map((c) => (
              <CategoryCard key={c.category} category={c} />
            ))}
          </div>
        </section>

        <section className="border-y border-white/5 bg-ink-900/40 py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">The Roast</h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
                {PERSONALITY_LABELS[audit.personality]} mode
              </span>
            </div>
            <div className="card-surface rounded-2xl p-6 sm:p-8">
              <p className="font-display text-xl font-bold text-white sm:text-2xl">{audit.roast.headline}</p>
              <div className="mt-5 space-y-4">
                {audit.roast.lines.map((line, i) => (
                  <p key={i} className="text-lg leading-relaxed text-white/80">
                    {line.text}
                  </p>
                ))}
              </div>
              <p className="mt-6 border-t border-white/10 pt-5 font-display text-lg font-semibold text-flame-400">
                {audit.roast.closer}
              </p>
            </div>

            <div className="mt-6">
              <ShareButtons
                shareUrl={shareUrl}
                ogImageUrl={ogImageUrl}
                tweetText={`My website scored ${audit.overallScore}/100 on RoastMyWebsite.lol 💀 "${audit.roast.lines[0]?.text ?? audit.roast.headline}"`}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-bold">What actually needs fixing</h2>
          <p className="mt-1 text-white/50">Prioritized, plain-English, and grounded in real findings — not invented ones.</p>
          <div className="mt-8">
            <FindingList findings={audit.findings} />
          </div>

          {audit.unmeasured.length > 0 && (
            <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/40">
              <div className="mb-2 font-semibold uppercase tracking-wider text-white/30">Could not be measured</div>
              <ul className="space-y-1">
                {audit.unmeasured.map((u) => (
                  <li key={u.key}>
                    <span className="text-white/60">{u.label}:</span> {u.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="border-t border-white/5 py-16 text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Think your website can survive?</h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#roast-form"
              className="rounded-xl bg-flame-gradient px-6 py-3.5 font-display font-bold text-white shadow-lg shadow-flame-600/30 transition hover:brightness-110"
            >
              ROAST ANOTHER WEBSITE 🔥
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-display font-bold text-white transition hover:bg-white/10"
            >
              Beat my score
            </Link>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Think your website scores better than ${audit.overallScore}/100? Prove it 👀`)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-display font-bold text-white transition hover:bg-white/10"
            >
              Challenge a friend
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
