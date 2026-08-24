import type { Finding, SiteSignals } from '@/types/audit';

const LARGE_PAGE_BYTES = 1_500_000; // 1.5MB HTML document is heavy
const HEAVY_JS_BYTES = 300_000;
const HEAVY_CSS_BYTES = 150_000;
const SLOW_RESPONSE_MS = 1200;

export function performanceFindings(s: SiteSignals): Finding[] {
  const f: Finding[] = [];

  if (s.pageSizeBytes !== null && s.pageSizeBytes > LARGE_PAGE_BYTES) {
    f.push({
      id: 'large_page_weight',
      category: 'performance',
      severity: 'high',
      problem: `The homepage HTML document is ${(s.pageSizeBytes / 1_000_000).toFixed(1)}MB.`,
      whyItMatters: 'Heavier pages take longer to download and parse, directly hurting load time, especially on mobile networks.',
      evidence: `${s.pageSizeBytes.toLocaleString()} bytes transferred for the HTML document alone.`,
      fix: 'Audit for bloated inline content, unminified markup, and unnecessary embedded data.',
    });
  }

  if (s.imagesTotal > 0) {
    // Without real byte-level image sizes we don't fabricate a number, but
    // a very high image count on a single page is itself a real signal.
    if (s.imagesTotal > 25) {
      f.push({
        id: 'unoptimized_images',
        category: 'performance',
        severity: 'medium',
        problem: `The homepage embeds ${s.imagesTotal} images.`,
        whyItMatters: 'A high image count usually means uncompressed assets and unnecessary requests dragging down load time.',
        evidence: `${s.imagesTotal} <img> tags found on the homepage.`,
        fix: 'Compress images, use modern formats (WebP/AVIF), lazy-load below-the-fold images, and serve responsive sizes.',
      });
    }
  }

  if (s.renderBlockingCount >= 3) {
    f.push({
      id: 'render_blocking_resources',
      category: 'performance',
      severity: 'high',
      problem: `${s.renderBlockingCount} render-blocking script/stylesheet tags were found in the page.`,
      whyItMatters: 'Render-blocking resources delay first paint — the browser must download and process them before showing anything.',
      evidence: `${s.renderBlockingCount} synchronous <script> tags in <head> or <link rel="stylesheet"> tags detected.`,
      fix: 'Defer or async non-critical scripts, and inline or preload critical CSS.',
    });
  }

  if (s.scriptCount > 15) {
    f.push({
      id: 'heavy_javascript',
      category: 'performance',
      severity: 'medium',
      problem: `${s.scriptCount} separate <script> tags were found on the homepage.`,
      whyItMatters: 'Excess JavaScript increases parse/execution time and often signals unused third-party tags or bundling issues.',
      evidence: `${s.scriptCount} script tags detected${s.scriptBytesApprox ? `, ~${Math.round(s.scriptBytesApprox / 1024)}KB inline` : ''}.`,
      fix: 'Audit third-party scripts, remove unused ones, and bundle/split the rest.',
    });
  }

  if (s.cssBytesApprox > HEAVY_CSS_BYTES) {
    f.push({
      id: 'heavy_css',
      category: 'performance',
      severity: 'low',
      problem: `Roughly ${Math.round(s.cssBytesApprox / 1024)}KB of inline CSS was found.`,
      whyItMatters: 'Large stylesheets increase parse time and often contain unused rules.',
      evidence: `~${Math.round(s.cssBytesApprox / 1024)}KB of inline <style> content detected.`,
      fix: 'Purge unused CSS and split critical from non-critical styles.',
    });
  }

  if (!s.hasCacheHeaders) {
    f.push({
      id: 'no_caching_headers',
      category: 'performance',
      severity: 'medium',
      problem: 'No caching headers (Cache-Control, ETag, or Last-Modified) were found on the homepage response.',
      whyItMatters: 'Without caching hints, browsers and CDNs re-fetch the same content on every visit, wasting bandwidth and time.',
      evidence: 'Response had no Cache-Control, ETag, or Last-Modified header.',
      fix: 'Set appropriate Cache-Control headers for static assets and cacheable HTML.',
    });
  }

  if (s.responseTimeMs !== null && s.responseTimeMs > SLOW_RESPONSE_MS) {
    f.push({
      id: 'slow_ttfb',
      category: 'performance',
      severity: 'high',
      problem: `The server took ${s.responseTimeMs}ms to respond to the homepage request.`,
      whyItMatters: 'A slow time-to-first-byte delays everything downstream, including how fast content can start rendering.',
      evidence: `Measured response time: ${s.responseTimeMs}ms`,
      fix: 'Investigate server-side bottlenecks: enable caching, use a CDN, or upgrade hosting.',
    });
  }

  if (s.coreWebVitals.source === 'not_available') {
    f.push({
      id: 'cwv_not_available',
      category: 'performance',
      severity: 'low',
      problem: 'Core Web Vitals (LCP, CLS, INP) could not be measured.',
      whyItMatters: 'These are Google\'s official real-user performance signals and directly affect rankings and perceived speed.',
      evidence: 'PageSpeed Insights API key not configured, or no field/lab data was returned for this URL.',
      fix: 'Configure a PageSpeed Insights API key, or check field data directly in Google Search Console.',
    });
  }

  return f;
}
