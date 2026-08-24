import type { Finding, SiteSignals } from '@/types/audit';

const NAV_TOO_COMPLEX = 9;

export function uxFindings(s: SiteSignals): Finding[] {
  const f: Finding[] = [];

  if (s.navLinkCount >= NAV_TOO_COMPLEX) {
    f.push({
      id: 'nav_too_complex',
      category: 'ux',
      severity: 'medium',
      problem: `The main navigation/header contains ${s.navLinkCount} links.`,
      whyItMatters: 'Overloaded navigation increases cognitive load and makes it harder for visitors to find what they need.',
      evidence: `${s.navLinkCount} links found inside <nav> or <header> elements.`,
      fix: 'Group related links under a handful of top-level items, or move secondary links to the footer.',
    });
  }

  if (!s.hasTrustSignals) {
    f.push({
      id: 'no_trust_signals',
      category: 'ux',
      severity: 'medium',
      problem: 'No testimonials, reviews, client logos, or other trust signals were detected.',
      whyItMatters: 'Trust signals reduce perceived risk and are one of the strongest conversion levers on a homepage.',
      evidence: 'No testimonial/review/client-related keywords found in visible text.',
      fix: 'Add real testimonials, client logos, review scores, or case study links.',
    });
  }

  if (!s.hasContactInfo) {
    f.push({
      id: 'no_contact_info',
      category: 'ux',
      severity: 'medium',
      problem: 'No contact information (email, phone, contact link, or address) was found.',
      whyItMatters: 'Visitors researching a purchase decision often look for a way to reach a real person before committing.',
      evidence: 'No mailto:, tel:, contact link, or address text detected.',
      fix: 'Add visible contact details or a clear link to a contact page.',
    });
  }

  if (!s.hasViewport) {
    f.push({
      id: 'not_mobile_friendly',
      category: 'ux',
      severity: 'high',
      problem: 'The page has no responsive viewport configuration.',
      whyItMatters: 'The majority of web traffic is mobile — a non-responsive layout means most visitors get a broken experience.',
      evidence: 'No <meta name="viewport"> tag found.',
      fix: 'Add a responsive viewport meta tag and verify the layout adapts to small screens.',
    });
  }

  return f;
}
