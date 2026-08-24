import type { Finding, SiteSignals } from '@/types/audit';

const THIN_CONTENT_WORDS = 150;
const GENERIC_PHRASES = [
  'we are passionate about', 'best in class', 'world class', 'cutting edge',
  'innovative solutions', 'synergy', 'state of the art', 'think outside the box',
  'customer centric', 'end to end solutions', 'seamless experience',
];

export function contentFindings(s: SiteSignals): Finding[] {
  const f: Finding[] = [];

  if (s.wordCount < THIN_CONTENT_WORDS) {
    f.push({
      id: 'thin_content',
      category: 'content',
      severity: 'high',
      problem: `The homepage has only about ${s.wordCount} words of visible text.`,
      whyItMatters: 'Thin content gives search engines little to understand and rank the page for, and gives visitors little reason to trust or stay.',
      evidence: `Approximate visible word count: ${s.wordCount}`,
      fix: 'Expand the homepage with real substance: what you do, who it\'s for, proof it works, and what to do next.',
    });
  }

  const bodyLower = (s.h1s.join(' ') + ' ' + (s.title ?? '') + ' ' + (s.metaDescription ?? '')).toLowerCase();
  const genericHits = GENERIC_PHRASES.filter((p) => bodyLower.includes(p));
  if (genericHits.length > 0) {
    f.push({
      id: 'generic_copy',
      category: 'content',
      severity: 'medium',
      problem: 'The headline copy leans on generic corporate phrases instead of concrete claims.',
      whyItMatters: 'Vague phrases like these say nothing specific about what a visitor gets, which weakens both conversion and topical SEO relevance.',
      evidence: `Detected phrase(s): ${genericHits.map((g) => `"${g}"`).join(', ')}`,
      fix: 'Replace generic phrases with specific, concrete statements about the product, audience, and outcome.',
    });
  }

  if (s.h1s.length > 0 && s.h1s[0] && s.h1s[0].split(' ').length <= 3 && s.wordCount < 400) {
    f.push({
      id: 'unclear_value_prop',
      category: 'content',
      severity: 'medium',
      problem: 'The homepage does not clearly explain what the site offers within the visible heading and body copy.',
      whyItMatters: 'Visitors decide whether to stay within seconds — an unclear value proposition above the fold increases bounce rate.',
      evidence: `H1: "${s.h1s[0]}" with limited supporting copy (${s.wordCount} words total).`,
      fix: 'State clearly, near the top of the page, what you offer, who it\'s for, and why it matters.',
    });
  }

  const headingTexts = s.headingOutline.map((h) => h.text.trim().toLowerCase()).filter(Boolean);
  const dupes = headingTexts.filter((t, i) => headingTexts.indexOf(t) !== i);
  if (dupes.length > 0) {
    f.push({
      id: 'duplicate_headings_text',
      category: 'content',
      severity: 'low',
      problem: 'Multiple headings on the page repeat the exact same text.',
      whyItMatters: 'Duplicate headings waste an opportunity to describe distinct sections and can look repetitive or auto-generated.',
      evidence: `Repeated heading text: "${dupes[0]}"`,
      fix: 'Give each heading unique, descriptive text specific to its section.',
    });
  }

  const hasContactSection = s.hasContactInfo;
  const hasAboutish = headingTexts.some((t) => /about|who we are|our story|mission/.test(t));
  if (!hasContactSection && !hasAboutish && s.wordCount < 600) {
    f.push({
      id: 'missing_important_sections',
      category: 'content',
      severity: 'low',
      problem: 'The homepage appears to be missing key trust sections like an About or Contact area.',
      whyItMatters: 'Visitors and search engines both use these sections to judge legitimacy and find ways to engage further.',
      evidence: 'No contact-related text/links and no About/mission-style heading detected.',
      fix: 'Add a short About section and visible contact details (email, form, or address).',
    });
  }

  return f;
}
