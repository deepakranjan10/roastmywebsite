import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { assertSafeUrl, normalizeUrlForCache, UnsafeUrlError } from '@/lib/security/url-guard';
import { FetchLimitError } from '@/lib/analyzer/safe-fetch';
import { checkRateLimit, clientKeyFromHeaders } from '@/lib/rate-limit';
import { findCachedAudit, saveAudit } from '@/lib/store';
import { runAudit } from '@/lib/pipeline';
import type { Personality } from '@/types/audit';
import { PERSONALITY_LABELS } from '@/types/audit';

export const runtime = 'nodejs';

const RequestSchema = z.object({
  url: z.string().min(3).max(2048),
  personality: z.enum(Object.keys(PERSONALITY_LABELS) as [Personality, ...Personality[]]).default('savage'),
  isPublic: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const clientKey = clientKeyFromHeaders(req.headers);
  const rl = checkRateLimit(clientKey);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many roasts, too fast. Give it a minute.' },
      { status: 429, headers: { 'Retry-After': Math.ceil(rl.retryAfterMs / 1000).toString() } }
    );
  }

  let body: z.infer<typeof RequestSchema>;
  try {
    const json = await req.json();
    body = RequestSchema.parse(json);
  } catch {
    return NextResponse.json({ error: 'Invalid request. Provide a valid URL.' }, { status: 400 });
  }

  let normalized: string;
  try {
    const { url } = await assertSafeUrl(body.url);
    normalized = normalizeUrlForCache(url);
  } catch (err) {
    if (err instanceof UnsafeUrlError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Could not validate that URL.' }, { status: 400 });
  }

  const cached = await findCachedAudit(normalized, body.personality);
  if (cached) {
    return NextResponse.json({ id: cached.id, domain: cached.domain, cached: true });
  }

  try {
    const result = await runAudit({ url: body.url, personality: body.personality, isPublic: body.isPublic });
    await saveAudit(result, normalized);
    return NextResponse.json({ id: result.id, domain: result.domain, cached: false });
  } catch (err) {
    if (err instanceof UnsafeUrlError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof FetchLimitError) {
      return NextResponse.json({ error: `Couldn't finish loading that site in time: ${err.message}` }, { status: 422 });
    }
    console.error('Audit pipeline failed', err);
    return NextResponse.json(
      { error: "We couldn't reach or analyze that site. Double check the URL and try again." },
      { status: 502 }
    );
  }
}
