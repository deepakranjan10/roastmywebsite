import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getLeaderboard } from '@/lib/store';
import { CATEGORY_LABELS } from '@/types/audit';

export const metadata: Metadata = {
  title: 'Leaderboard — Worst Websites We\'ve Roasted',
  description: 'The public leaderboard of the lowest-scoring, most brutally roasted websites on RoastMyWebsite.lol — all published with explicit consent.',
};

export const revalidate = 60;

export default async function LeaderboardPage() {
  const entries = await getLeaderboard(50);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <div className="text-center">
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
              Worst websites <span className="text-gradient-flame">we&apos;ve roasted</span>
            </h1>
            <p className="mt-3 text-white/50">
              Only sites whose owners opted in are listed here. Nobody gets publicly roasted without asking for it.
            </p>
          </div>

          {entries.length === 0 ? (
            <div className="card-surface mt-10 rounded-2xl p-10 text-center text-white/50">
              Nobody has opted into the public leaderboard yet. Be the first to be brave.
              <div className="mt-5">
                <Link
                  href="/#roast-form"
                  className="inline-block rounded-xl bg-flame-gradient px-5 py-3 font-display font-bold text-white"
                >
                  Roast my website 🔥
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Worst category</th>
                    <th className="px-4 py-3 hidden md:table-cell">Roast</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {entries.map((e, i) => (
                    <tr key={e.id} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-3 text-white/40">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/roast/${e.domain}/${e.id}`} className="hover:text-flame-400">
                          {e.domain}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-flame-500">{e.overallScore}</td>
                      <td className="px-4 py-3 hidden text-white/60 sm:table-cell">
                        {e.worstCategory ? `${CATEGORY_LABELS[e.worstCategory.category]} (${e.worstCategory.score})` : '—'}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-white/50 hidden md:table-cell">{e.roastHeadline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
