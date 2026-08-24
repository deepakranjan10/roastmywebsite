import { PrismaClient } from '@prisma/client';

/**
 * Lazily-instantiated Prisma client, reused across hot reloads in dev.
 * Returns null when DATABASE_URL isn't configured so the app can still run
 * (audits fall back to an in-memory store — see store.ts) without infra.
 */

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;

  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  return global.__prisma;
}

export const hasDatabase = Boolean(process.env.DATABASE_URL);
