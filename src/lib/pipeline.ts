import { randomBytes } from 'node:crypto';
import { analyzeSite } from '@/lib/analyzer/fetch-site';
import { generateAllFindings } from '@/lib/analyzer/rules';
import { scoreCategories, scoreOverall, overallVerdict } from '@/lib/scoring';
import { generateRoast } from '@/lib/roast/engine';
import { maybeEnhanceRoast } from '@/lib/roast/openai-enhance';
import { getScreenshotUrl } from '@/lib/screenshot';
import { PERSONALITIES } from '@/lib/roast/personalities';
import type { AuditResult, Personality } from '@/types/audit';

export interface RunAuditOptions {
  url: string;
  personality: Personality;
  isPublic: boolean;
}

/**
 * The full pipeline described in the product spec: validate -> analyze ->
 * collect signals -> generate findings -> score -> roast -> shareable
 * result. Every stage is a pure function operating on the previous
 * stage's typed output, so nothing downstream can invent data the
 * analyzer didn't actually observe.
 */
export async function runAudit(opts: RunAuditOptions): Promise<AuditResult> {
  const { signals, unmeasured } = await analyzeSite(opts.url);

  const findings = generateAllFindings(signals);
  const categories = scoreCategories(signals, findings);
  const overallScore = scoreOverall(categories);
  const { status, verdict } = overallVerdict(overallScore);

  let roast = generateRoast(findings, signals, opts.personality, overallScore);
  roast = await maybeEnhanceRoast(roast, PERSONALITIES[opts.personality].label);

  const id = generateId();

  return {
    id,
    url: opts.url,
    domain: signals.domain,
    finalUrl: signals.finalUrl,
    createdAt: new Date().toISOString(),
    personality: opts.personality,
    overallScore,
    overallStatus: status,
    overallVerdict: verdict,
    categories,
    roast,
    findings,
    unmeasured,
    screenshotUrl: getScreenshotUrl(signals.finalUrl),
    isPublic: opts.isPublic,
  };
}

function generateId(): string {
  return randomBytes(6).toString('base64url');
}
