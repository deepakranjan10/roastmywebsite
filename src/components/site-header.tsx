import Link from 'next/link';
import { Logo } from '@/components/logo';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-4 text-sm text-white/60 sm:gap-6">
          <Link href="/leaderboard" className="hover:text-white transition-colors">
            Leaderboard
          </Link>
          <Link href="/website-audit" className="hidden sm:inline hover:text-white transition-colors">
            SEO Guides
          </Link>
          <Link
            href="/#roast-form"
            className="rounded-full bg-flame-gradient px-4 py-1.5 font-semibold text-white shadow-lg shadow-flame-600/20 hover:brightness-110 transition"
          >
            Roast a site
          </Link>
        </nav>
      </div>
    </header>
  );
}
