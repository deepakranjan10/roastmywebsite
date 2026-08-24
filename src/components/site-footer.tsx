import Link from 'next/link';

const SEO_LINKS = [
  { href: '/seo-roast', label: 'SEO Roast' },
  { href: '/website-roast', label: 'Website Roast' },
  { href: '/website-seo-checker', label: 'Website SEO Checker' },
  { href: '/website-audit', label: 'Website Audit' },
  { href: '/technical-seo-checker', label: 'Technical SEO Checker' },
  { href: '/website-performance-checker', label: 'Website Performance Checker' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <div className="font-display text-lg font-bold">
              roastmywebsite<span className="text-flame-500">.lol</span>
            </div>
            <p className="mt-2 text-sm text-white/50">
              A brutally honest, genuinely useful AI website roast &amp; audit tool. No signup, no sales call, just pain.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/40">Free tools</div>
            <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 text-sm text-white/60 sm:grid-cols-2">
              {SEO_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/leaderboard" className="hover:text-white transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-white/30 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} RoastMyWebsite.lol — roast the website, not the person.</span>
          <span>Findings are generated from real, measurable signals. Nothing here is invented.</span>
        </div>
      </div>
    </footer>
  );
}
