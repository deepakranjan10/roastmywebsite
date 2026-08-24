import clsx from 'clsx';
import type { CategoryScore } from '@/types/audit';

const CATEGORY_EMOJI: Record<CategoryScore['category'], string> = {
  technicalSeo: '🛠',
  performance: '💀',
  content: '📝',
  ux: '😬',
  conversion: '🎯',
  accessibility: '♿',
};

const STATUS_STYLE: Record<CategoryScore['status'], string> = {
  critical: 'text-flame-600 bg-flame-600/10 border-flame-600/30',
  poor: 'text-flame-500 bg-flame-500/10 border-flame-500/30',
  okay: 'text-flame-400 bg-flame-400/10 border-flame-400/30',
  good: 'text-acid-400 bg-acid-400/10 border-acid-400/30',
  excellent: 'text-acid-500 bg-acid-500/10 border-acid-500/30',
};

export function CategoryCard({ category }: { category: CategoryScore }) {
  const topFinding = [...category.findings].sort((a, b) => severityRank(a.severity) - severityRank(b.severity))[0];

  return (
    <div className="card-surface rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-display font-bold">
          <span>{CATEGORY_EMOJI[category.category]}</span>
          {category.label}
        </div>
        <span className={clsx('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider', STATUS_STYLE[category.status])}>
          {category.status}
        </span>
      </div>

      <div className="mt-3 font-display text-3xl font-extrabold">{category.score}</div>

      {topFinding && (
        <p className="mt-3 text-sm leading-snug text-white/60">
          <span className="font-semibold text-white/80">Top issue: </span>
          {topFinding.problem}
        </p>
      )}

      {category.workingWell.length > 0 && (
        <p className="mt-2 text-xs text-acid-400/80">✓ {category.workingWell[0]}</p>
      )}

      {category.findings.length === 0 && (
        <p className="mt-3 text-sm text-white/40">No issues found in this category. Suspicious. Impressive.</p>
      )}
    </div>
  );
}

function severityRank(s: string) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[s] ?? 4;
}
