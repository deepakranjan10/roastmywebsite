import type { Finding, Personality, Roast, RoastLine, SiteSignals } from '@/types/audit';
import { PERSONALITIES, seededPick } from '@/lib/roast/personalities';
import { jokeFor } from '@/lib/roast/jokes';

const SEVERITY_RANK: Record<Finding['severity'], number> = { critical: 0, high: 1, medium: 2, low: 3 };

const MAX_ROAST_LINES = 6;

/**
 * Turns structured findings into a personality-flavored roast. The roast
 * is generated deterministically from real findings (never invented facts)
 * so the same site + personality always produces the same roast, keeping
 * cached audits and shared links stable.
 */
export function generateRoast(
  findings: Finding[],
  signals: SiteSignals,
  personality: Personality,
  overallScore: number
): Roast {
  const voice = PERSONALITIES[personality];
  const seed = `${signals.domain}:${personality}`;

  const headline = pickByScore(voice.headlines, overallScore).text;
  const closer = pickByScore(voice.closers, overallScore).text;

  const ranked = [...findings].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
  const seen = new Set<string>();
  const chosen: Finding[] = [];
  for (const finding of ranked) {
    if (chosen.length >= MAX_ROAST_LINES) break;
    // Avoid two lines that are effectively about the same underlying issue.
    if (seen.has(finding.id)) continue;
    seen.add(finding.id);
    chosen.push(finding);
  }

  const lines: RoastLine[] = chosen.map((finding, i) => {
    const base = jokeFor(finding, signals);
    const lineSeed = `${seed}:${finding.id}:${i}`;
    const opener = i === 0 ? `${seededPick(voice.openers, seed)} ` : '';
    return {
      text: `${opener}${voice.stylize(base, lineSeed)}`,
      findingId: finding.id,
    };
  });

  if (lines.length === 0) {
    lines.push({ text: voice.stylize('This homepage is suspiciously well put together. We checked twice.', seed) });
  }

  return { personality, headline, lines, closer };
}

function pickByScore<T extends { min: number }>(items: readonly T[], score: number): T {
  const sorted = [...items].sort((a, b) => b.min - a.min);
  return sorted.find((item) => score >= item.min) ?? sorted[sorted.length - 1]!;
}
