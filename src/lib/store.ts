import { getPrisma, hasDatabase } from '@/lib/db';
import type { AuditResult, Category, CategoryScore, Finding, Personality, Roast } from '@/types/audit';

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes — caps repeat-analysis cost per URL+personality

export interface LeaderboardEntry {
  id: string;
  domain: string;
  overallScore: number;
  createdAt: string;
  roastHeadline: string;
  slowestMs: number | null;
  worstCategory: { category: Category; score: number } | null;
}

// ---------------------------------------------------------------------------
// In-memory fallback store. Used automatically when DATABASE_URL is unset,
// so the product still runs end-to-end without provisioning Postgres. Not
// durable across restarts — that trade-off is documented in .env.example.
// ---------------------------------------------------------------------------
const memoryAudits = new Map<string, AuditResult>();
const memoryCacheIndex = new Map<string, { id: string; expiresAt: number }>();

function cacheKey(normalizedUrl: string, personality: Personality) {
  return `${normalizedUrl}::${personality}`;
}

export async function findCachedAudit(normalizedUrl: string, personality: Personality): Promise<AuditResult | null> {
  const prisma = getPrisma();
  if (prisma) {
    const website = await prisma.website.findFirst({ where: { url: normalizedUrl } });
    if (!website) return null;
    const audit = await prisma.audit.findFirst({
      where: { websiteId: website.id, personality, createdAt: { gte: new Date(Date.now() - CACHE_TTL_MS) } },
      orderBy: { createdAt: 'desc' },
      include: { scores: true, findings: true, roast: true, website: true },
    });
    return audit ? toAuditResult(audit) : null;
  }

  const entry = memoryCacheIndex.get(cacheKey(normalizedUrl, personality));
  if (!entry || entry.expiresAt < Date.now()) return null;
  return memoryAudits.get(entry.id) ?? null;
}

export async function saveAudit(result: AuditResult, normalizedUrl: string): Promise<void> {
  const prisma = getPrisma();
  if (prisma) {
    const website = await prisma.website.upsert({
      where: { domain: result.domain },
      update: { url: normalizedUrl },
      create: { domain: result.domain, url: normalizedUrl },
    });

    await prisma.audit.create({
      data: {
        id: result.id,
        websiteId: website.id,
        personality: result.personality,
        overallScore: result.overallScore,
        overallStatus: result.overallStatus,
        overallVerdict: result.overallVerdict,
        finalUrl: result.finalUrl,
        screenshotUrl: result.screenshotUrl,
        isPublic: result.isPublic,
        scores: {
          create: result.categories.map((c) => ({
            category: c.category,
            score: c.score,
            status: c.status,
            workingWell: c.workingWell,
          })),
        },
        findings: {
          create: result.findings.map((f) => ({
            findingId: f.id,
            category: f.category,
            severity: f.severity,
            problem: f.problem,
            whyItMatters: f.whyItMatters,
            evidence: f.evidence,
            fix: f.fix,
          })),
        },
        roast: {
          create: {
            personality: result.roast.personality,
            headline: result.roast.headline,
            lines: JSON.parse(JSON.stringify(result.roast.lines)),
            closer: result.roast.closer,
          },
        },
      },
    });
    return;
  }

  memoryAudits.set(result.id, result);
  memoryCacheIndex.set(cacheKey(normalizedUrl, result.personality), {
    id: result.id,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export async function getAuditById(id: string): Promise<AuditResult | null> {
  const prisma = getPrisma();
  if (prisma) {
    const audit = await prisma.audit.findUnique({
      where: { id },
      include: { scores: true, findings: true, roast: true, website: true },
    });
    return audit ? toAuditResult(audit) : null;
  }
  return memoryAudits.get(id) ?? null;
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const prisma = getPrisma();
  let audits: AuditResult[];

  if (prisma) {
    const rows = await prisma.audit.findMany({
      where: { isPublic: true },
      orderBy: { overallScore: 'asc' },
      take: limit,
      include: { scores: true, findings: true, roast: true, website: true },
    });
    audits = rows.map(toAuditResult);
  } else {
    audits = Array.from(memoryAudits.values())
      .filter((a) => a.isPublic)
      .sort((a, b) => a.overallScore - b.overallScore)
      .slice(0, limit);
  }

  return audits.map((a) => {
    const worst = [...a.categories].sort((x, y) => x.score - y.score)[0] ?? null;
    return {
      id: a.id,
      domain: a.domain,
      overallScore: a.overallScore,
      createdAt: a.createdAt,
      roastHeadline: a.roast.headline,
      slowestMs: null,
      worstCategory: worst ? { category: worst.category, score: worst.score } : null,
    };
  });
}

export { hasDatabase };

// ---------------------------------------------------------------------------
// Prisma row -> AuditResult mapping
// ---------------------------------------------------------------------------
// Using `any` here for the Prisma include result keeps this file decoupled
// from generated Prisma types (which don't exist until `prisma generate`
// runs), while the return type stays fully typed as AuditResult.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAuditResult(row: any): AuditResult {
  const categories: CategoryScore[] = (row.scores ?? []).map((s: any) => ({
    category: s.category,
    label: s.category,
    score: s.score,
    status: s.status,
    workingWell: s.workingWell as string[],
    findings: (row.findings ?? []).filter((f: any) => f.category === s.category).map(toFinding),
  }));

  const roast: Roast = row.roast
    ? {
        personality: row.roast.personality,
        headline: row.roast.headline,
        lines: row.roast.lines,
        closer: row.roast.closer,
      }
    : { personality: row.personality, headline: '', lines: [], closer: '' };

  return {
    id: row.id,
    url: row.website?.url ?? row.finalUrl,
    domain: row.website?.domain ?? '',
    finalUrl: row.finalUrl,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    personality: row.personality,
    overallScore: row.overallScore,
    overallStatus: row.overallStatus,
    overallVerdict: row.overallVerdict,
    categories,
    roast,
    findings: (row.findings ?? []).map(toFinding),
    unmeasured: [],
    screenshotUrl: row.screenshotUrl ?? null,
    isPublic: row.isPublic,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toFinding(f: any): Finding {
  return {
    id: f.findingId,
    category: f.category,
    severity: f.severity,
    problem: f.problem,
    whyItMatters: f.whyItMatters,
    evidence: f.evidence,
    fix: f.fix,
  };
}
