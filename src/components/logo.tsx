import Link from 'next/link';
import clsx from 'clsx';

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <Link href="/" className={clsx('flex items-center gap-2 group', className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-md border border-flame-500/40 bg-ink-800">
        <span className="text-base group-hover:animate-flicker">🔥</span>
      </span>
      {!iconOnly && (
        <span className="font-display text-lg font-bold tracking-tight">
          roastmywebsite<span className="text-flame-500">.lol</span>
        </span>
      )}
    </Link>
  );
}
