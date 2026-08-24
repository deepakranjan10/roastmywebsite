import type { Finding, SiteSignals } from '@/types/audit';

export function accessibilityFindings(s: SiteSignals): Finding[] {
  const f: Finding[] = [];

  if (s.imagesTotal > 0 && s.imagesMissingAlt > 0) {
    const ratio = s.imagesMissingAlt / s.imagesTotal;
    f.push({
      id: 'images_missing_alt',
      category: 'accessibility',
      severity: ratio > 0.5 ? 'high' : 'medium',
      problem: `${s.imagesMissingAlt} of ${s.imagesTotal} images are missing alt text.`,
      whyItMatters: 'Alt text lets screen reader users understand images and lets search engines index them for image search.',
      evidence: `${s.imagesMissingAlt}/${s.imagesTotal} <img> tags have no alt attribute or an empty one.`,
      fix: 'Add descriptive alt text to every meaningful image; use alt="" only for purely decorative images.',
    });
  }

  if (s.formCount > 0 && s.formInputsMissingLabels > 0) {
    f.push({
      id: 'inputs_missing_labels',
      category: 'accessibility',
      severity: 'medium',
      problem: `${s.formInputsMissingLabels} form input(s) have no programmatically associated label.`,
      whyItMatters: 'Screen readers announce form fields by their label — without one, the field is effectively unusable for blind users.',
      evidence: `${s.formInputsMissingLabels} inputs without a <label>, aria-label, or wrapping label.`,
      fix: 'Associate every input with a visible <label for="id"> element.',
    });
  }

  if (s.emptyLinksOrButtons > 0) {
    f.push({
      id: 'empty_links_or_buttons',
      category: 'accessibility',
      severity: 'medium',
      problem: `${s.emptyLinksOrButtons} link(s) or button(s) have no accessible text.`,
      whyItMatters: 'A link or button with no text is announced as just "link" or "button" by screen readers, giving no clue what it does.',
      evidence: `${s.emptyLinksOrButtons} <a>/<button> elements with no text, aria-label, or alt-carrying image found.`,
      fix: 'Add visible text or an aria-label describing the destination or action of every interactive element.',
    });
  }

  const skipped = headingOrderSkipped(s.headingOutline);
  if (skipped) {
    f.push({
      id: 'heading_order_skipped',
      category: 'accessibility',
      severity: 'low',
      problem: 'The heading hierarchy skips levels.',
      whyItMatters: 'Screen reader users often navigate by heading level; skipped levels break that mental map of the page.',
      evidence: `Heading sequence: ${s.headingOutline.slice(0, 8).map((h) => `H${h.level}`).join(' → ')}`,
      fix: 'Fix the heading order so levels step down one at a time.',
    });
  }

  if (s.nonSemanticDivButtonCount > 0) {
    f.push({
      id: 'non_semantic_markup',
      category: 'accessibility',
      severity: 'low',
      problem: `${s.nonSemanticDivButtonCount} clickable <div>/<span> element(s) were found instead of real buttons or links.`,
      whyItMatters: 'Non-semantic clickable elements are usually invisible to keyboard and screen reader users unless carefully patched with ARIA.',
      evidence: `${s.nonSemanticDivButtonCount} <div>/<span> elements with onclick handlers detected.`,
      fix: 'Replace with real <button> or <a> elements, which get keyboard and screen reader support for free.',
    });
  }

  return f;
}

function headingOrderSkipped(outline: { level: number; text: string }[]): boolean {
  let prev = 0;
  for (const h of outline) {
    if (prev !== 0 && h.level - prev > 1) return true;
    prev = h.level;
  }
  return false;
}
