import clsx from 'clsx';

function colorForScore(score: number): string {
  if (score < 30) return '#ff2d55';
  if (score < 50) return '#ff5c33';
  if (score < 70) return '#ff9d5c';
  if (score < 85) return '#c2ff00';
  return '#7cff8f';
}

export function ScoreRing({
  score,
  size = 160,
  strokeWidth = 12,
  label,
  className,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);
  const color = colorForScore(score);

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#1e1e2a" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.34,1.56,.64,1)', filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-extrabold leading-none" style={{ color }}>
          {score}
        </span>
        <span className="mt-1 text-[11px] uppercase tracking-widest text-white/40">/100</span>
        {label && <span className="mt-1 text-xs text-white/50">{label}</span>}
      </div>
    </div>
  );
}

export function MiniScoreBar({ label, score }: { label: string; score: number }) {
  const color = colorForScore(score);
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs text-white/60 sm:w-28">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(4, score)}%`, background: color }}
        />
      </div>
      <span className="w-8 shrink-0 text-right font-mono text-xs font-semibold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}
