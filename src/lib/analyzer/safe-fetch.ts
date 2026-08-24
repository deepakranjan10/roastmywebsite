import { assertSafeUrl, UnsafeUrlError } from '@/lib/security/url-guard';

/**
 * A fetch wrapper for untrusted, user-submitted URLs. It re-validates every
 * redirect hop (not just the initial URL) against the SSRF guard, enforces
 * a hard timeout and a maximum response size, and caps the number of
 * redirects it will follow. This is the only way analyzer code is allowed
 * to reach a user-submitted origin.
 */

const MAX_REDIRECTS = 5;
const DEFAULT_TIMEOUT_MS = 8000;
const MAX_BYTES = 3 * 1024 * 1024; // 3MB cap on any single fetched resource

export class FetchLimitError extends Error {}

export interface SafeFetchResult {
  ok: boolean;
  status: number;
  finalUrl: string;
  headers: Headers;
  body: string;
  bytes: number;
  redirectCount: number;
  responseTimeMs: number;
}

export async function safeFetch(
  rawUrl: string,
  opts: { timeoutMs?: number; maxBytes?: number; method?: 'GET' | 'HEAD' } = {}
): Promise<SafeFetchResult> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = opts.maxBytes ?? MAX_BYTES;
  const method = opts.method ?? 'GET';

  let currentUrl = rawUrl;
  let redirectCount = 0;
  const start = Date.now();

  while (true) {
    const { url } = await assertSafeUrl(currentUrl);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method,
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'RoastMyWebsiteBot/1.0 (+https://roastmywebsite.lol/bot)',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
    } catch (err) {
      clearTimeout(timer);
      if ((err as Error).name === 'AbortError') {
        throw new FetchLimitError(`Request to ${url.hostname} timed out.`);
      }
      throw err;
    }
    clearTimeout(timer);

    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      redirectCount += 1;
      if (redirectCount > MAX_REDIRECTS) {
        throw new FetchLimitError('Too many redirects.');
      }
      const location = res.headers.get('location')!;
      currentUrl = new URL(location, url).toString();
      // Loop back around: assertSafeUrl re-validates the new host so a
      // redirect can never smuggle us into a private network.
      continue;
    }

    const bodyText = await readBodyWithLimit(res, maxBytes);

    return {
      ok: res.ok,
      status: res.status,
      finalUrl: url.toString(),
      headers: res.headers,
      body: bodyText.text,
      bytes: bodyText.bytes,
      redirectCount,
      responseTimeMs: Date.now() - start,
    };
  }
}

async function readBodyWithLimit(res: Response, maxBytes: number): Promise<{ text: string; bytes: number }> {
  if (!res.body) {
    const text = await res.text();
    return { text, bytes: Buffer.byteLength(text) };
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        chunks.push(value.subarray(0, Math.max(0, maxBytes - (total - value.byteLength))));
        break;
      }
      chunks.push(value);
    }
  }

  const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  return { text: buf.toString('utf-8'), bytes: total };
}

export { UnsafeUrlError };
