import type { Category, CategoryScore, Finding, Severity, SiteSignals } from '@/types/audit';
import { CATEGORY_LABELS } from '@/types/audit';

/**
 * Scoring model
 * =============
 *
 * Each category starts at 100 and takes a deduction per finding, weighted
 * by severity. This is intentionally not a blind average of "problems
 * found" — a single critical issue (e.g. noindex, or zero CTAs) should
 * hurt far more than five low-severity nits, because that's how much they
 * actually matter to a real visitor or crawler.
 *
 * Per-finding deductions (points off a 100-point category):
 *   critical -> 28
 *   high     -> 16
 *   medium   -> 9
 *   low      -> 4
 * Deductions are additive but the category score floors at 0, and a
 * category with zero findings floors at 100 (nothing observed is wrong).
 *
 * Overall score
 * -------------
 * The overall score is a WEIGHTED average of category scores, not a
 * simple mean, because these categories are not equally consequential to
 * whether a website actually works for a visitor or a search engine:
 *
 *   Technical SEO   25%  — if a crawler can't index it, nothing else matters
 *   Performance     20%  — speed is both a ranking factor and a conversion killer
 *   Content         15%  — substance and clarity of what's being said
 *   UX              15%  — whether a human can use the thing
 *   Conversion      15%  — whether using it leads anywhere
 *   Accessibility   10%  — legal/ethical baseline, correlates with markup quality
 *
 * Weights are defined once here and never duplicated elsewhere.
 */
export const CATEGORY_WEIGHTS: Record<Category, number> = {
  technicalSeo: 0.25,
  performance: 0.2,
  content: 0.15,
  ux: 0.15,
  conversion: 0.15,
  accessibility: 0.1,
};

const SEVERITY_DEDUCTION: Record<Severity, number> = {
  critical: 28,
  high: 16,
  medium: 9,
  low: 4,
};

function scoreCategory(findings: Finding[]): number {
  const deduction = findings.reduce((sum, f) => sum + SEVERITY_DEDUCTION[f.severity], 0);
  return Math.max(0, Math.round(100 - deduction));
}

function statusForScore(score: number): CategoryScore['status'] {
  if (score < 30) return 'critical';
  if (score < 50) return 'poor';
  if (score < 70) return 'okay';
  if (score < 90) return 'good';
  return 'excellent';
}

function workingWellFor(category: Category, s: SiteSignals, findings: Finding[]): string[] {
  const wins: string[] = [];
  const has = (id: string) => !findings.some((f) => f.id === id);

  switch (category) {
    case 'technicalSeo':
      if (s.isHttps) wins.push('Served over HTTPS.');
      if (s.title && has('title_too_long') && has('title_too_short')) wins.push('Title tag is present and a healthy length.');
      if (s.metaDescription && has('meta_description_too_long') && has('meta_description_too_short')) wins.push('Meta description is present and well-sized.');
      if (s.h1s.length === 1) wins.push('Exactly one clear H1.');
      if (s.hasStructuredData) wins.push('Structured data (JSON-LD) is present.');
      if (s.hasSitemap) wins.push('XML sitemap found.');
      break;
    case 'performance':
      if (s.hasCacheHeaders) wins.push('Caching headers are set.');
      if (s.renderBlockingCount < 3) wins.push('Few render-blocking resources.');
      if (s.responseTimeMs !== null && s.responseTimeMs < 600) wins.push('Fast server response time.');
      break;
    case 'content':
      if (s.wordCount >= 300) wins.push('Homepage has substantive written content.');
      if (has('generic_copy')) wins.push('Copy avoids generic filler phrases.');
      break;
    case 'ux':
      if (s.hasViewport) wins.push('Responsive/mobile viewport configured.');
      if (s.navLinkCount > 0 && s.navLinkCount < 9) wins.push('Navigation is a manageable size.');
      if (s.hasContactInfo) wins.push('Contact information is easy to find.');
      break;
    case 'conversion':
      if (s.ctaCount > 0 && s.ctaCount < 10) wins.push('A clear, focused call-to-action is present.');
      if (s.hasTrustSignals) wins.push('Trust signals (testimonials/reviews) are present.');
      break;
    case 'accessibility':
      if (s.imagesTotal === 0 || s.imagesMissingAlt === 0) wins.push('Images have alt text.');
      if (s.emptyLinksOrButtons === 0) wins.push('Links and buttons all have accessible text.');
      break;
  }
  return wins;
}

export function scoreCategories(signals: SiteSignals, allFindings: Finding[]): CategoryScore[] {
  const categories = Object.keys(CATEGORY_WEIGHTS) as Category[];
  return categories.map((category) => {
    const findings = allFindings.filter((f) => f.category === category);
    const score = scoreCategory(findings);
    return {
      category,
      label: CATEGORY_LABELS[category],
      score,
      status: statusForScore(score),
      workingWell: workingWellFor(category, signals, findings),
      findings,
    };
  });
}

export function scoreOverall(categoryScores: CategoryScore[]): number {
  const weighted = categoryScores.reduce((sum, c) => sum + c.score * CATEGORY_WEIGHTS[c.category], 0);
  return Math.round(weighted);
}

export function overallVerdict(score: number): { status: string; verdict: string } {
  if (score < 30) return { status: 'Critical condition', verdict: 'Needs therapy.' };
  if (score < 50) return { status: 'Struggling', verdict: 'Send help.' };
  if (score < 70) return { status: 'Mid', verdict: 'It works. Barely.' };
  if (score < 85) return { status: 'Solid', verdict: 'Genuinely not bad.' };
  return { status: 'Excellent', verdict: 'Show-off.' };
}
