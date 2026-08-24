import clsx from 'clsx';
import type { Finding, Severity } from '@/types/audit';
import { CATEGORY_LABELS } from '@/types/audit';

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

const SEVERITY_STYLE: Record<Severity, { label: string; badge: string }> = {
  critical: { label: 'Critical', badge: 'bg-flame-700/20 text-flame-600 border-flame-700/40' },
  high: { label: 'High', badge: 'bg-flame-600/15 text-flame-500 border-flame-600/30' },
  medium: { label: 'Medium', badge: 'bg-flame-400/15 text-flame-400 border-flame-400/30' },
  low: { label: 'Low', badge: 'bg-white/10 text-white/50 border-white/20' },
};

export function FindingList({ findings }: { findings: Finding[] }) {
  const grouped = SEVERITY_ORDER.map((sev) => ({
    severity: sev,
    items: findings.filter((f) => f.severity === sev),
  })).filter((g) => g.items.length > 0);

  if (grouped.length === 0) {
    return <p className="text-white/50">No actionable issues found. Genuinely rare. Well done.</p>;
  }

  return (
    <div className="space-y-8">
      {grouped.map((group) => (
        <div key={group.severity}>
          <div className="mb-3 flex items-center gap-2">
            <span className={clsx('rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider', SEVERITY_STYLE[group.severity].badge)}>
              {SEVERITY_STYLE[group.severity].label}
            </span>
            <span className="text-xs text-white/40">{group.items.length} issue{group.items.length === 1 ? '' : 's'}</span>
          </div>
          <div className="space-y-3">
            {group.items.map((f) => (
              <FindingCard key={f.id} finding={f} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <details className="group card-surface rounded-xl px-4 py-3 open:bg-white/[0.04]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div>
          <span className="mr-2 rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white/40">
            {CATEGORY_LABELS[finding.category]}
          </span>
          <span className="font-medium text-white/90">{finding.problem}</span>
        </div>
        <span className="shrink-0 text-white/30 transition-transform group-open:rotate-180">⌄</span>
      </summary>
      <div className="mt-3 grid gap-2 border-t border-white/10 pt-3 text-sm text-white/60 sm:grid-cols-3">
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">Why it matters</div>
          {finding.whyItMatters}
        </div>
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">Evidence</div>
          <span className="font-mono text-xs text-white/50">{finding.evidence}</span>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-acid-400/70">Fix</div>
          {finding.fix}
        </div>
      </div>
    </details>
  );
}
