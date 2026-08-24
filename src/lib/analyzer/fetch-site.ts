import { safeFetch, FetchLimitError } from '@/lib/analyzer/safe-fetch';
import { parseHtmlSignals, extractInternalLinkSample } from '@/lib/analyzer/parse-html';
import { UnsafeUrlError } from '@/lib/security/url-guard';
import type { SiteSignals, Unmeasured } from '@/types/audit';
import { getCoreWebVitals } from '@/lib/analyzer/pagespeed';

const MAX_LINKS_TO_CHECK = 8;

export interface AnalyzedSite {
  signals: SiteSignals;
  unmeasured: Unmeasured[];
  html: string;
}

export { UnsafeUrlError, FetchLimitError };

export async function analyzeSite(rawUrl: string): Promise<AnalyzedSite> {
  const unmeasured: Unmeasured[] = [];

  const homepage = await safeFetch(rawUrl);

  if (!homepage.ok && homepage.status !== 0) {
    // Still analyze what we got (some sites return real content on 4xx),
    // but the bad status itself becomes a finding downstream.
  }

  const origin = new URL(homepage.finalUrl);

  const [robotsResult, sitemapResult, cwv] = await Promise.allSettled([
    safeFetch(new URL('/robots.txt', origin).toString(), { timeoutMs: 4000 }),
    checkSitemap(origin),
    getCoreWebVitals(homepage.finalUrl),
  ]);

  const hasRobotsTxt = robotsResult.status === 'fulfilled' && robotsResult.value.ok;
  const hasSitemap = sitemapResult.status === 'fulfilled' && sitemapResult.value;

  const coreWebVitals =
    cwv.status === 'fulfilled'
      ? cwv.value
      : { lcpMs: null, cls: null, inpMs: null, source: 'not_available' as const };

  if (coreWebVitals.source === 'not_available') {
    unmeasured.push({
      key: 'core_web_vitals',
      label: 'Core Web Vitals (LCP, CLS, INP)',
      reason: 'PageSpeed Insights API key not configured, or the API did not return field/lab data for this URL.',
    });
  }

  const hasCacheHeaders = Boolean(
    homepage.headers.get('cache-control') || homepage.headers.get('etag') || homepage.headers.get('last-modified')
  );

  const signals = parseHtmlSignals({
    html: homepage.body,
    finalUrl: homepage.finalUrl,
    status: homepage.status,
    redirectCount: homepage.redirectCount,
    responseTimeMs: homepage.responseTimeMs,
    pageSizeBytes: homepage.bytes,
    hasRobotsTxt,
    hasSitemap,
    hasCacheHeaders,
    coreWebVitals,
  });

  // Best-effort broken-internal-link sample. Never lets a single bad link
  // fail the whole audit.
  const sample = extractInternalLinkSample(homepage.body, homepage.finalUrl, MAX_LINKS_TO_CHECK);
  signals.brokenInternalLinks = await countBrokenLinks(sample);
  signals.requestCount = null; // not observable from a single server-side fetch; left unmeasured

  unmeasured.push({
    key: 'request_count',
    label: 'Total network requests',
    reason: 'Server-side fetch only retrieves the HTML document; a full browser trace is required to count all requests.',
  });

  return { signals, unmeasured, html: homepage.body };
}

async function checkSitemap(origin: URL): Promise<boolean> {
  try {
    const res = await safeFetch(new URL('/sitemap.xml', origin).toString(), { timeoutMs: 4000, method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

async function countBrokenLinks(links: string[]): Promise<number> {
  let broken = 0;
  for (const link of links) {
    try {
      const res = await safeFetch(link, { timeoutMs: 4000, method: 'HEAD' });
      if (res.status >= 400) broken += 1;
    } catch {
      // A single unreachable sample link isn't proof of brokenness (could be
      // our own timeout); skip rather than over-count.
    }
  }
  return broken;
}
