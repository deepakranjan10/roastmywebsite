import * as cheerio from 'cheerio';
import type { SiteSignals } from '@/types/audit';

const CTA_WORDS = [
  'buy', 'shop', 'get started', 'sign up', 'signup', 'subscribe', 'download',
  'book', 'contact', 'try', 'demo', 'order', 'join', 'learn more', 'start',
  'add to cart', 'checkout', 'apply', 'request', 'schedule', 'call',
];

const TRUST_SIGNAL_HINTS = [
  'testimonial', 'review', 'trusted by', 'as seen in', 'client', 'customer',
  'rating', 'award', 'certified', 'guarantee', 'secure', 'privacy policy',
  'case stud',
];

const CONTACT_HINTS = ['contact', 'mailto:', 'tel:', 'support@', 'address'];

function textLength($: cheerio.CheerioAPI): number {
  const text = $('body').clone().find('script,style,noscript').remove().end().text();
  return text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

function countScriptBytes($: cheerio.CheerioAPI): { count: number; inlineBytes: number; renderBlocking: number } {
  let count = 0;
  let inlineBytes = 0;
  let renderBlocking = 0;
  $('script').each((_, el) => {
    count += 1;
    const $el = $(el);
    const src = $el.attr('src');
    const isAsyncOrDefer = $el.attr('async') !== undefined || $el.attr('defer') !== undefined;
    const inHead = $(el).parents('head').length > 0;
    if (src && inHead && !isAsyncOrDefer) renderBlocking += 1;
    if (!src) inlineBytes += Buffer.byteLength($el.html() ?? '');
  });
  return { count, inlineBytes, renderBlocking };
}

function countCssBytes($: cheerio.CheerioAPI): { bytes: number; renderBlocking: number } {
  let bytes = 0;
  let renderBlocking = 0;
  $('style').each((_, el) => {
    bytes += Buffer.byteLength($(el).html() ?? '');
  });
  $('link[rel="stylesheet"]').each(() => {
    renderBlocking += 1;
  });
  return { bytes, renderBlocking };
}

export function parseHtmlSignals(params: {
  html: string;
  finalUrl: string;
  status: number;
  redirectCount: number;
  responseTimeMs: number;
  pageSizeBytes: number;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  hasCacheHeaders: boolean;
  coreWebVitals: SiteSignals['coreWebVitals'];
}): SiteSignals {
  const { html, finalUrl } = params;
  const $ = cheerio.load(html);
  const url = new URL(finalUrl);

  const title = $('title').first().text().trim() || null;
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null;
  const canonical = $('link[rel="canonical"]').attr('href')?.trim() || null;
  const metaRobots = $('meta[name="robots"]').attr('content')?.trim() || null;

  const h1s = $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean);

  const headingOutline: { level: number; text: string }[] = [];
  $('h1,h2,h3,h4,h5,h6').each((_, el) => {
    const level = Number(el.tagName.slice(1));
    headingOutline.push({ level, text: $(el).text().trim() });
  });

  const images = $('img');
  const imagesTotal = images.length;
  const imagesMissingAlt = images.filter((_, el) => {
    const alt = $(el).attr('alt');
    return alt === undefined || alt.trim() === '';
  }).length;

  let internalLinks = 0;
  let externalLinks = 0;
  const internalHrefs: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    try {
      const resolved = new URL(href, url);
      if (resolved.hostname === url.hostname) {
        internalLinks += 1;
        internalHrefs.push(resolved.toString());
      } else {
        externalLinks += 1;
      }
    } catch {
      // ignore unparsable hrefs
    }
  });

  const hasStructuredData = $('script[type="application/ld+json"]').length > 0;
  const hasOpenGraph = $('meta[property^="og:"]').length > 0;
  const hasFavicon = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').length > 0;
  const langAttribute = $('html').attr('lang')?.trim() || null;
  const hasViewport = $('meta[name="viewport"]').length > 0;

  const bodyText = ($('body').text() || '').toLowerCase();
  const buttonsAndLinks = $('a,button');
  let ctaCount = 0;
  buttonsAndLinks.each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    const isButtonish = el.tagName === 'button' || $(el).attr('role') === 'button' || $(el).hasClass('btn') || $(el).hasClass('button');
    if (isButtonish && text) {
      ctaCount += 1;
      return;
    }
    if (CTA_WORDS.some((w) => text.includes(w))) ctaCount += 1;
  });

  const navLinkCount = $('nav a, header a').length;

  const forms = $('form');
  const formCount = forms.length;
  let formInputsMissingLabels = 0;
  forms.each((_, form) => {
    $(form).find('input,textarea,select').each((_, input) => {
      const $input = $(input);
      const type = ($input.attr('type') || '').toLowerCase();
      if (['hidden', 'submit', 'button', 'checkbox', 'radio'].includes(type)) return;
      const id = $input.attr('id');
      const hasLabel = !!(id && $(`label[for="${id}"]`).length) || $input.attr('aria-label') || $input.attr('placeholder') || $input.closest('label').length;
      if (!hasLabel) formInputsMissingLabels += 1;
    });
  });

  const hasContactInfo = CONTACT_HINTS.some((hint) => bodyText.includes(hint) || html.toLowerCase().includes(hint));
  const hasTrustSignals = TRUST_SIGNAL_HINTS.some((hint) => bodyText.includes(hint));

  const wordCount = textLength($);

  const { count: scriptCount, inlineBytes: scriptBytesApprox, renderBlocking: scriptRenderBlocking } = countScriptBytes($);
  const { bytes: cssBytesApprox, renderBlocking: cssRenderBlocking } = countCssBytes($);

  let emptyLinksOrButtons = 0;
  buttonsAndLinks.each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    const hasAriaLabel = !!$el.attr('aria-label');
    const hasImgAlt = $el.find('img[alt]').length > 0;
    if (!text && !hasAriaLabel && !hasImgAlt) emptyLinksOrButtons += 1;
  });

  const nonSemanticDivButtonCount = $('div[onclick], span[onclick]').length;

  return {
    finalUrl,
    domain: url.hostname,
    httpStatus: params.status,
    isHttps: url.protocol === 'https:',
    redirectCount: params.redirectCount,
    responseTimeMs: params.responseTimeMs,
    pageSizeBytes: params.pageSizeBytes,
    requestCount: null,
    title,
    metaDescription,
    canonical,
    metaRobots,
    h1s,
    headingOutline,
    hasRobotsTxt: params.hasRobotsTxt,
    hasSitemap: params.hasSitemap,
    imagesTotal,
    imagesMissingAlt,
    internalLinks,
    externalLinks,
    brokenInternalLinks: 0,
    hasStructuredData,
    hasOpenGraph,
    hasFavicon,
    langAttribute,
    hasViewport,
    ctaCount,
    navLinkCount,
    formCount,
    formInputsMissingLabels,
    hasContactInfo,
    hasTrustSignals,
    wordCount,
    scriptCount,
    scriptBytesApprox,
    cssBytesApprox,
    renderBlockingCount: scriptRenderBlocking + cssRenderBlocking,
    hasCacheHeaders: params.hasCacheHeaders,
    emptyLinksOrButtons,
    nonSemanticDivButtonCount,
    coreWebVitals: params.coreWebVitals,
  };
}

/** Internal links (same-host) to spot-check for brokenness, capped by the caller. */
export function extractInternalLinkSample(html: string, finalUrl: string, limit: number): string[] {
  const $ = cheerio.load(html);
  const url = new URL(finalUrl);
  const seen = new Set<string>();
  const out: string[] = [];
  $('a[href]').each((_, el) => {
    if (out.length >= limit) return;
    const href = $(el).attr('href')?.trim();
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    try {
      const resolved = new URL(href, url);
      resolved.hash = '';
      if (resolved.hostname === url.hostname && !seen.has(resolved.toString())) {
        seen.add(resolved.toString());
        out.push(resolved.toString());
      }
    } catch {
      // ignore
    }
  });
  return out;
}
