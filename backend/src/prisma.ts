import { PrismaClient } from "@prisma/client";
declare global {
  var __PRISMA__: PrismaClient | undefined;
}

function newClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export function getPrisma(): PrismaClient {
  if (!globalThis.__PRISMA__) {
    globalThis.__PRISMA__ = newClient();
  }
  return globalThis.__PRISMA__;
}

export const prisma = getPrisma();
