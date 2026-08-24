/**
 * Shared types for the audit pipeline: analyzer -> scoring -> roast engine.
 * These types are the contract between every stage, so a finding created by
 * an analyzer is guaranteed to carry enough evidence for both the scorer
 * and the roast engine to use without re-deriving anything.
 */

export type Category =
  | 'technicalSeo'
  | 'performance'
  | 'content'
  | 'ux'
  | 'accessibility'
  | 'conversion';

export const CATEGORY_LABELS: Record<Category, string> = {
  technicalSeo: 'Technical SEO',
  performance: 'Performance',
  content: 'Content',
  ux: 'UX',
  accessibility: 'Accessibility',
  conversion: 'Conversion',
};

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type FindingId =
  // Technical SEO
  | 'http_status_error'
  | 'not_https'
  | 'redirect_chain'
  | 'missing_canonical'
  | 'missing_robots_txt'
  | 'missing_sitemap'
  | 'noindex'
  | 'missing_title'
  | 'title_too_long'
  | 'title_too_short'
  | 'missing_meta_description'
  | 'meta_description_too_long'
  | 'meta_description_too_short'
  | 'missing_h1'
  | 'multiple_h1'
  | 'heading_order_skipped'
  | 'broken_internal_links'
  | 'few_internal_links'
  | 'missing_structured_data'
  | 'missing_open_graph'
  | 'missing_favicon'
  | 'missing_lang_attribute'
  | 'missing_viewport'
  | 'messy_url_structure'
  // Performance
  | 'large_page_weight'
  | 'too_many_requests'
  | 'unoptimized_images'
  | 'render_blocking_resources'
  | 'heavy_javascript'
  | 'heavy_css'
  | 'no_caching_headers'
  | 'slow_ttfb'
  | 'cwv_not_available'
  // Content
  | 'thin_content'
  | 'generic_copy'
  | 'unclear_value_prop'
  | 'low_readability'
  | 'duplicate_headings_text'
  | 'missing_important_sections'
  // UX / Conversion
  | 'too_many_ctas'
  | 'no_clear_cta'
  | 'nav_too_complex'
  | 'no_trust_signals'
  | 'no_contact_info'
  | 'form_without_labels'
  | 'not_mobile_friendly'
  // Accessibility
  | 'images_missing_alt'
  | 'inputs_missing_labels'
  | 'empty_links_or_buttons'
  | 'non_semantic_markup';

export interface Finding {
  id: FindingId;
  category: Category;
  severity: Severity;
  problem: string;
  whyItMatters: string;
  evidence: string;
  fix: string;
}

/** A signal that could not be measured for technical reasons. Never guessed. */
export interface Unmeasured {
  key: string;
  label: string;
  reason: string;
}

export interface CategoryScore {
  category: Category;
  label: string;
  score: number; // 0-100
  status: 'critical' | 'poor' | 'okay' | 'good' | 'excellent';
  workingWell: string[];
  findings: Finding[];
}

export type Personality =
  | 'brutal'
  | 'savage'
  | 'corporate'
  | 'friendly'
  | 'indian_uncle'
  | 'developer'
  | 'seo_expert'
  | 'gen_z';

export const PERSONALITY_LABELS: Record<Personality, string> = {
  brutal: 'Brutal',
  savage: 'Savage',
  corporate: 'Corporate',
  friendly: 'Friendly',
  indian_uncle: 'Indian Uncle',
  developer: 'Developer',
  seo_expert: 'SEO Expert',
  gen_z: 'Gen Z',
};

export interface RoastLine {
  text: string;
  findingId?: FindingId;
}

export interface Roast {
  personality: Personality;
  headline: string;
  lines: RoastLine[];
  closer: string;
}

export interface SiteSignals {
  finalUrl: string;
  domain: string;
  httpStatus: number | null;
  isHttps: boolean;
  redirectCount: number;
  responseTimeMs: number | null;
  pageSizeBytes: number | null;
  requestCount: number | null;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  metaRobots: string | null;
  h1s: string[];
  headingOutline: { level: number; text: string }[];
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  imagesTotal: number;
  imagesMissingAlt: number;
  internalLinks: number;
  externalLinks: number;
  brokenInternalLinks: number;
  hasStructuredData: boolean;
  hasOpenGraph: boolean;
  hasFavicon: boolean;
  langAttribute: string | null;
  hasViewport: boolean;
  ctaCount: number;
  navLinkCount: number;
  formCount: number;
  formInputsMissingLabels: number;
  hasContactInfo: boolean;
  hasTrustSignals: boolean;
  wordCount: number;
  scriptCount: number;
  scriptBytesApprox: number;
  cssBytesApprox: number;
  renderBlockingCount: number;
  hasCacheHeaders: boolean;
  emptyLinksOrButtons: number;
  nonSemanticDivButtonCount: number;
  coreWebVitals: {
    lcpMs: number | null;
    cls: number | null;
    inpMs: number | null;
    source: 'pagespeed' | 'not_available';
  };
}

export interface AuditResult {
  id: string;
  url: string;
  domain: string;
  finalUrl: string;
  createdAt: string;
  personality: Personality;
  overallScore: number;
  overallStatus: string;
  overallVerdict: string;
  categories: CategoryScore[];
  roast: Roast;
  findings: Finding[];
  unmeasured: Unmeasured[];
  screenshotUrl: string | null;
  isPublic: boolean;
}
