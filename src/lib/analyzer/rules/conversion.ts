import type { Finding, SiteSignals } from '@/types/audit';

const TOO_MANY_CTAS = 10;

export function conversionFindings(s: SiteSignals): Finding[] {
  const f: Finding[] = [];

  if (s.ctaCount >= TOO_MANY_CTAS) {
    f.push({
      id: 'too_many_ctas',
      category: 'conversion',
      severity: 'high',
      problem: `The homepage has ${s.ctaCount} call-to-action buttons/links competing for attention.`,
      whyItMatters: 'When everything is a CTA, nothing is — visitors face decision paralysis instead of a clear next step.',
      evidence: `${s.ctaCount} button-like or CTA-worded elements detected.`,
      fix: 'Pick one primary action per page and demote the rest to secondary, visually quieter links.',
    });
  } else if (s.ctaCount === 0) {
    f.push({
      id: 'no_clear_cta',
      category: 'conversion',
      severity: 'critical',
      problem: 'No clear call-to-action was detected on the homepage.',
      whyItMatters: 'Without an obvious next step, visitors have no path to convert, no matter how good the content is.',
      evidence: 'No button-like elements or CTA-worded links found.',
      fix: 'Add one prominent, clearly-labeled primary CTA above the fold.',
    });
  }

  if (s.formCount > 0 && s.formInputsMissingLabels > 0) {
    f.push({
      id: 'form_without_labels',
      category: 'conversion',
      severity: 'medium',
      problem: `${s.formInputsMissingLabels} form field(s) have no associated label, placeholder, or aria-label.`,
      whyItMatters: 'Unlabeled fields confuse users about what to enter and are a common source of form abandonment.',
      evidence: `${s.formInputsMissingLabels} input/textarea/select elements without a discoverable label.`,
      fix: 'Add a <label for="..."> or aria-label to every form field.',
    });
  }

  if (!s.hasTrustSignals) {
    f.push({
      id: 'no_trust_signals',
      category: 'conversion',
      severity: 'medium',
      problem: 'No testimonials, reviews, client logos, or other trust signals were detected near the conversion path.',
      whyItMatters: 'Trust signals reduce perceived risk right before someone is asked to act — one of the highest-leverage conversion levers.',
      evidence: 'No testimonial/review/client-related keywords found in visible text.',
      fix: 'Place a testimonial, review score, or client logo near your primary CTA.',
    });
  }

  return f;
}
