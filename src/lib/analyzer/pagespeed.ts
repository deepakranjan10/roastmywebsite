import type { SiteSignals } from '@/types/audit';

/**
 * Optional integration with Google PageSpeed Insights for real Core Web
 * Vitals. Without PAGESPEED_API_KEY set, this returns "not_available"
 * rather than fabricating numbers — the rest of the pipeline treats that
 * as a metric to explicitly mark unmeasured, never a metric to guess.
 */
export async function getCoreWebVitals(url: string): Promise<SiteSignals['coreWebVitals']> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    return { lcpMs: null, cls: null, inpMs: null, source: 'not_available' };
  }

  try {
    const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    endpoint.searchParams.set('url', url);
    endpoint.searchParams.set('key', apiKey);
    endpoint.searchParams.set('strategy', 'mobile');
    endpoint.searchParams.set('category', 'performance');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(endpoint.toString(), { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return { lcpMs: null, cls: null, inpMs: null, source: 'not_available' };

    const data = (await res.json()) as {
      loadingExperience?: { metrics?: Record<string, { percentile?: number }> };
      lighthouseResult?: { audits?: Record<string, { numericValue?: number }> };
    };

    const fieldMetrics = data.loadingExperience?.metrics ?? {};
    const labAudits = data.lighthouseResult?.audits ?? {};

    const lcpMs =
      fieldMetrics['LARGEST_CONTENTFUL_PAINT_MS']?.percentile ??
      labAudits['largest-contentful-paint']?.numericValue ??
      null;
    const cls =
      (fieldMetrics['CUMULATIVE_LAYOUT_SHIFT_SCORE']?.percentile ?? null) !== null
        ? Number(fieldMetrics['CUMULATIVE_LAYOUT_SHIFT_SCORE']!.percentile) / 100
        : labAudits['cumulative-layout-shift']?.numericValue ?? null;
    const inpMs =
      fieldMetrics['INTERACTION_TO_NEXT_PAINT']?.percentile ??
      labAudits['interaction-to-next-paint']?.numericValue ??
      null;

    if (lcpMs === null && cls === null && inpMs === null) {
      return { lcpMs: null, cls: null, inpMs: null, source: 'not_available' };
    }

    return { lcpMs, cls, inpMs, source: 'pagespeed' };
  } catch {
    return { lcpMs: null, cls: null, inpMs: null, source: 'not_available' };
  }
}
