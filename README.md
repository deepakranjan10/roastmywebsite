# RoastMyWebsite.lol 🔥

An entertaining, brutally honest AI-powered website roast and audit tool.
Enter a URL, get a witty roast, a real 0–100 score across six categories,
and a prioritized, evidence-backed list of what to actually fix.

> "Lighthouse + an SEO audit + a stand-up comedian who knows web development."

## How it works

```
URL submitted
  -> SSRF guard validates + resolves the host (public IPs only)
  -> safe-fetch retrieves the homepage, robots.txt, sitemap.xml (size/time capped)
  -> parse-html extracts real signals (title, headings, CTAs, images, scripts, ...)
  -> rule-based analyzers turn signals into typed Findings (never invented)
  -> scoring engine turns Findings into weighted category + overall scores
  -> roast engine turns Findings into a personality-flavored roast
  -> result is cached, persisted, and given a shareable /roast/[domain]/[id] URL
```

Every finding is grounded in something actually measured on the page. When a
signal can't be measured (e.g. Core Web Vitals without a PageSpeed API key),
it's explicitly labeled "Not available" — never guessed.

## Tech stack

- **Next.js 14 (App Router) + React + TypeScript + Tailwind CSS**
- **Prisma + PostgreSQL** for persistence (`User`, `Website`, `Audit`,
  `AuditFinding`, `AuditScore`, `Roast`, `ShareLink`) — falls back to an
  in-memory store automatically when `DATABASE_URL` is unset, so the app
  runs end-to-end with zero infrastructure for local dev/demo.
- **Zod** for request validation
- Rule-based roast engine by default; optional **OpenAI** enhancement pass
  if `OPENAI_API_KEY` is set (never required, never on the critical path)
- Optional **Google PageSpeed Insights** integration for real Core Web
  Vitals (`PAGESPEED_API_KEY`)
- Optional screenshot service integration (`SCREENSHOT_SERVICE_URL`)
- `next/og` `ImageResponse` for the shareable OG/roast-card image

## Project structure

```
src/
  app/
    page.tsx                       Homepage
    roast/[domain]/[id]/page.tsx   Results dashboard (dynamic OG metadata)
    leaderboard/page.tsx           Opt-in public leaderboard
    seo-roast/, website-roast/, website-seo-checker/,
    website-audit/, technical-seo-checker/,
    website-performance-checker/   Real-content SEO landing pages
    api/roast/route.ts             POST: validate -> rate-limit -> analyze -> cache
    api/og/[id]/route.tsx          Shareable result image
    sitemap.ts, robots.ts
  components/                      UI (roast form, score ring, category cards, ...)
  lib/
    security/url-guard.ts          SSRF defense (DNS resolution + private-IP blocking)
    analyzer/                      safe-fetch, HTML parsing, PageSpeed, rule-based findings
    scoring/                       Weighted category + overall scoring (weights documented inline)
    roast/                         8 personalities + deterministic joke templates + engine
    pipeline.ts                    Orchestrates the full analyze -> score -> roast flow
    store.ts, db.ts                Prisma-backed persistence with in-memory fallback
    rate-limit.ts                  Per-IP rate limiting on the audit endpoint
  types/audit.ts                   Shared types for the whole pipeline
prisma/schema.prisma
```

## Getting started

```bash
npm install
cp .env.example .env        # fill in what you have; everything is optional except nothing
npx prisma generate         # safe to run even without a live DATABASE_URL
npm run dev
```

Open http://localhost:3000. Without `DATABASE_URL` set, audits are cached
in-memory only (not durable across restarts) — fine for local development.
To use Postgres:

```bash
# after setting DATABASE_URL in .env
npx prisma db push
```

## Security

- Only `http://`/`https://` URLs are accepted.
- Hostnames are DNS-resolved and checked against private/loopback/
  link-local/reserved IP ranges (including the cloud metadata endpoint)
  before any request is made — and again on every redirect hop, so a
  public host can't redirect the crawler into a private network.
- Fetches are time-limited (8s) and size-limited (3MB) with a max of 5
  redirects.
- The audit endpoint is rate-limited per IP, and recent audits are cached
  (15 min) per URL+personality to bound crawl and API cost.

## What's intentionally not in v1

Per the product brief, this MVP does not include authentication, billing,
teams, or an agency dashboard. Anonymous audits are the primary flow;
accounts are left as a clear extension point (`User` model, optional
`userId` on `Audit`) rather than being built out now.
