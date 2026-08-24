import type { Finding, SiteSignals } from '@/types/audit';

/**
 * Technical SEO findings, derived strictly from measured SiteSignals.
 * Nothing here is inferred beyond what was actually observed on the page.
 */
export function technicalSeoFindings(s: SiteSignals): Finding[] {
  const f: Finding[] = [];

  if (s.httpStatus !== null && s.httpStatus >= 400) {
    f.push({
      id: 'http_status_error',
      category: 'technicalSeo',
      severity: 'critical',
      problem: `The homepage responded with HTTP ${s.httpStatus}.`,
      whyItMatters: 'Search engines and visitors alike cannot reliably access a page that errors out.',
      evidence: `Observed status code: ${s.httpStatus}`,
      fix: 'Fix the server error or routing issue so the homepage returns a 200 response.',
    });
  }

  if (!s.isHttps) {
    f.push({
      id: 'not_https',
      category: 'technicalSeo',
      severity: 'critical',
      problem: 'The site is not served over HTTPS.',
      whyItMatters: 'Browsers flag HTTP sites as "Not Secure", and Google uses HTTPS as a ranking signal.',
      evidence: `Final URL scheme: ${new URL(s.finalUrl).protocol}`,
      fix: 'Install a TLS certificate and redirect all HTTP traffic to HTTPS.',
    });
  }

  if (s.redirectCount >= 2) {
    f.push({
      id: 'redirect_chain',
      category: 'technicalSeo',
      severity: 'medium',
      problem: `The homepage went through ${s.redirectCount} redirects before loading.`,
      whyItMatters: 'Each redirect hop adds latency and can dilute link equity passed to the final URL.',
      evidence: `${s.redirectCount} redirect hops observed before reaching ${s.finalUrl}`,
      fix: 'Point primary links directly at the final destination URL to cut the redirect chain to at most one hop.',
    });
  }

  if (!s.canonical) {
    f.push({
      id: 'missing_canonical',
      category: 'technicalSeo',
      severity: 'low',
      problem: 'No canonical tag was found on the homepage.',
      whyItMatters: 'Without a canonical URL, search engines have to guess which version of a page to index if duplicates exist (e.g. with/without trailing slash, http/https, query params).',
      evidence: 'No <link rel="canonical"> element in <head>.',
      fix: 'Add a self-referencing canonical tag to the homepage and every important page.',
    });
  }

  if (!s.hasRobotsTxt) {
    f.push({
      id: 'missing_robots_txt',
      category: 'technicalSeo',
      severity: 'medium',
      problem: 'No robots.txt file was found.',
      whyItMatters: 'robots.txt tells crawlers what they can access and typically points them to your sitemap.',
      evidence: 'GET /robots.txt did not return a successful response.',
      fix: 'Add a robots.txt file at the domain root, even if it just allows all crawling and links to your sitemap.',
    });
  }

  if (!s.hasSitemap) {
    f.push({
      id: 'missing_sitemap',
      category: 'technicalSeo',
      severity: 'medium',
      problem: 'No XML sitemap was found at /sitemap.xml.',
      whyItMatters: 'A sitemap helps search engines discover and prioritize your pages, especially on larger or newer sites.',
      evidence: 'GET /sitemap.xml did not return a successful response.',
      fix: 'Generate an XML sitemap listing your important pages and submit it in Search Console.',
    });
  }

  if (s.metaRobots && /noindex/i.test(s.metaRobots)) {
    f.push({
      id: 'noindex',
      category: 'technicalSeo',
      severity: 'critical',
      problem: 'The homepage has a noindex directive.',
      whyItMatters: 'A noindex tag tells search engines not to show this page in results at all — it will not rank for anything.',
      evidence: `meta robots content="${s.metaRobots}"`,
      fix: 'Remove the noindex directive unless you are deliberately hiding this page from search.',
    });
  }

  if (!s.title) {
    f.push({
      id: 'missing_title',
      category: 'technicalSeo',
      severity: 'critical',
      problem: 'The homepage has no <title> tag.',
      whyItMatters: 'The title tag is the single strongest on-page SEO signal and what shows as the clickable headline in search results.',
      evidence: 'No <title> element found, or it was empty.',
      fix: 'Write a unique, descriptive title (50-60 characters) that includes your primary keyword and brand.',
    });
  } else if (s.title.length > 60) {
    f.push({
      id: 'title_too_long',
      category: 'technicalSeo',
      severity: 'low',
      problem: `The title tag is ${s.title.length} characters long and will likely be truncated in search results.`,
      whyItMatters: 'Google typically truncates titles beyond ~60 characters, cutting off your message.',
      evidence: `Title: "${s.title}"`,
      fix: 'Trim the title to under 60 characters while keeping the primary keyword near the front.',
    });
  } else if (s.title.length < 15) {
    f.push({
      id: 'title_too_short',
      category: 'technicalSeo',
      severity: 'low',
      problem: `The title tag is only ${s.title.length} characters long.`,
      whyItMatters: 'A very short title wastes an opportunity to describe the page and include relevant keywords.',
      evidence: `Title: "${s.title}"`,
      fix: 'Expand the title to clearly describe the page and brand, ideally 50-60 characters.',
    });
  }

  if (!s.metaDescription) {
    f.push({
      id: 'missing_meta_description',
      category: 'technicalSeo',
      severity: 'high',
      problem: 'No meta description was found.',
      whyItMatters: 'Without one, Google writes its own snippet from page content, which is often less compelling than a crafted one.',
      evidence: 'No <meta name="description"> element found.',
      fix: 'Write a compelling 140-160 character description that summarizes the page and includes a reason to click.',
    });
  } else if (s.metaDescription.length > 160) {
    f.push({
      id: 'meta_description_too_long',
      category: 'technicalSeo',
      severity: 'low',
      problem: `The meta description is ${s.metaDescription.length} characters and will likely be truncated.`,
      whyItMatters: 'Search results truncate long descriptions, potentially cutting off your call to action.',
      evidence: `Description: "${s.metaDescription.slice(0, 80)}..."`,
      fix: 'Trim the description to 140-160 characters.',
    });
  } else if (s.metaDescription.length < 50) {
    f.push({
      id: 'meta_description_too_short',
      category: 'technicalSeo',
      severity: 'low',
      problem: `The meta description is only ${s.metaDescription.length} characters.`,
      whyItMatters: 'A short description under-uses the space Google gives you to sell the click.',
      evidence: `Description: "${s.metaDescription}"`,
      fix: 'Expand the description to 140-160 characters with a clear value proposition.',
    });
  }

  if (s.h1s.length === 0) {
    f.push({
      id: 'missing_h1',
      category: 'technicalSeo',
      severity: 'high',
      problem: 'The homepage has no H1 heading.',
      whyItMatters: 'The H1 is the primary signal to both users and search engines about what the page is about.',
      evidence: 'No <h1> element found on the page.',
      fix: 'Add a single, descriptive H1 that states the main purpose of the page.',
    });
  } else if (s.h1s.length > 1) {
    f.push({
      id: 'multiple_h1',
      category: 'technicalSeo',
      severity: 'low',
      problem: `The homepage has ${s.h1s.length} H1 headings.`,
      whyItMatters: 'Multiple H1s dilute the page\'s topical focus and can confuse the heading hierarchy.',
      evidence: `H1s found: ${s.h1s.slice(0, 5).map((h) => `"${h}"`).join(', ')}`,
      fix: 'Keep a single H1 that captures the primary topic, and demote the rest to H2/H3.',
    });
  }

  const skipped = headingOrderSkipped(s.headingOutline);
  if (skipped) {
    f.push({
      id: 'heading_order_skipped',
      category: 'technicalSeo',
      severity: 'low',
      problem: 'The heading structure skips levels (e.g. H1 straight to H3).',
      whyItMatters: 'A broken heading hierarchy makes the content structure harder for screen readers and search engines to parse.',
      evidence: `Heading sequence: ${s.headingOutline.slice(0, 8).map((h) => `H${h.level}`).join(' → ')}`,
      fix: 'Reorder headings so each level steps down by one (H1 → H2 → H3) without skipping.',
    });
  }

  if (s.brokenInternalLinks > 0) {
    f.push({
      id: 'broken_internal_links',
      category: 'technicalSeo',
      severity: s.brokenInternalLinks >= 3 ? 'high' : 'medium',
      problem: `${s.brokenInternalLinks} sampled internal link(s) returned an error.`,
      whyItMatters: 'Broken links waste crawl budget, hurt user trust, and can strand link equity on dead pages.',
      evidence: `${s.brokenInternalLinks} of a sample of internal links returned a 4xx/5xx status.`,
      fix: 'Run a full site crawl to find every broken link, then fix or 301-redirect them.',
    });
  }

  if (s.internalLinks < 3) {
    f.push({
      id: 'few_internal_links',
      category: 'technicalSeo',
      severity: 'low',
      problem: `Only ${s.internalLinks} internal link(s) found on the homepage.`,
      whyItMatters: 'Internal links help search engines discover your other pages and distribute authority across the site.',
      evidence: `${s.internalLinks} same-domain links detected.`,
      fix: 'Link to key category, product, or content pages from the homepage.',
    });
  }

  if (!s.hasStructuredData) {
    f.push({
      id: 'missing_structured_data',
      category: 'technicalSeo',
      severity: 'low',
      problem: 'No structured data (JSON-LD) was found.',
      whyItMatters: 'Structured data helps search engines understand your content and can unlock rich results (stars, FAQs, breadcrumbs).',
      evidence: 'No <script type="application/ld+json"> found.',
      fix: 'Add relevant Schema.org JSON-LD (Organization, WebSite, Product, or FAQ as applicable).',
    });
  }

  if (!s.hasOpenGraph) {
    f.push({
      id: 'missing_open_graph',
      category: 'technicalSeo',
      severity: 'low',
      problem: 'No Open Graph tags were found.',
      whyItMatters: 'Without Open Graph tags, links shared on social media and Slack render as bare, unattractive previews.',
      evidence: 'No <meta property="og:*"> tags found.',
      fix: 'Add og:title, og:description, og:image and og:url tags.',
    });
  }

  if (!s.hasFavicon) {
    f.push({
      id: 'missing_favicon',
      category: 'technicalSeo',
      severity: 'low',
      problem: 'No favicon was found.',
      whyItMatters: 'A missing favicon looks unfinished in browser tabs, bookmarks, and search results.',
      evidence: 'No <link rel="icon"> or equivalent found.',
      fix: 'Add a favicon (ideally multiple sizes) linked from the <head>.',
    });
  }

  if (!s.langAttribute) {
    f.push({
      id: 'missing_lang_attribute',
      category: 'technicalSeo',
      severity: 'low',
      problem: 'The <html> tag has no lang attribute.',
      whyItMatters: 'The lang attribute helps search engines and assistive technology identify the page language correctly.',
      evidence: 'No lang attribute on <html>.',
      fix: 'Add lang="en" (or the appropriate language code) to the <html> tag.',
    });
  }

  if (!s.hasViewport) {
    f.push({
      id: 'missing_viewport',
      category: 'technicalSeo',
      severity: 'high',
      problem: 'No responsive viewport meta tag was found.',
      whyItMatters: 'Without it, mobile browsers render the desktop layout and zoom out, badly hurting mobile usability and rankings.',
      evidence: 'No <meta name="viewport"> found.',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
    });
  }

  const url = new URL(s.finalUrl);
  if (/[A-Z]/.test(url.pathname) || /_/.test(url.pathname) || /\?.*&.*&.*&/.test(url.search)) {
    f.push({
      id: 'messy_url_structure',
      category: 'technicalSeo',
      severity: 'low',
      problem: 'The URL structure uses uppercase letters, underscores, or heavy query strings.',
      whyItMatters: 'Clean, lowercase, hyphenated URLs are easier for both users and search engines to read and trust.',
      evidence: `URL path: ${url.pathname}${url.search}`,
      fix: 'Use lowercase, hyphen-separated URLs and avoid unnecessary query parameters for primary pages.',
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
