import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db: PrismaClient | null = (() => {
  const url = process.env.DATABASE_URL;
  // Allow builds / demos without a live database; data layer falls back to catalog.ts
  if (!url) return null;
  try {
    return (
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      })
    );
  } catch {
    return null;
  }
})();

if (process.env.NODE_ENV !== "production" && db) {
  globalForPrisma.prisma = db;
}

export async function dbSafe<T>(fn: (tx: PrismaClient) => Promise<T>, fallback: T): Promise<T> {
  if (!db) return fallback;
  try {
    return await fn(db);
  } catch {
    return fallback;
  }
}
