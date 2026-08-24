/**
 * Simple in-memory fixed-window rate limiter keyed by IP. This is
 * per-instance (not distributed) which is an accepted trade-off for the
 * MVP — it still stops a single client from hammering the analyze
 * endpoint and driving up crawl/API cost, which is the actual goal here.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 6;

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// Prevent unbounded growth in a long-lived process.
const MAX_TRACKED_KEYS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    bucket = { count: 0, windowStart: now };
    if (buckets.size >= MAX_TRACKED_KEYS) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey) buckets.delete(oldestKey);
    }
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const allowed = bucket.count <= MAX_REQUESTS_PER_WINDOW;
  const retryAfterMs = allowed ? 0 : WINDOW_MS - (now - bucket.windowStart);

  return {
    allowed,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - bucket.count),
    retryAfterMs,
  };
}

export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
