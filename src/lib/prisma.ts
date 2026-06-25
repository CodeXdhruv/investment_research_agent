import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

const getDbUrl = () => {
  const val = process.env.DATABASE_URL || process.env['DATABASE_URL'];
  return val === 'undefined' ? undefined : val;
};
const connectionString = getDbUrl()?.replace(/^"|"$/g, '');
if (!connectionString) throw new Error("DATABASE_URL is not set");

// Prisma 7+ fix: PrismaNeon is a factory that takes a config object, NOT a Pool instance.
const adapter = new PrismaNeon({ connectionString });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
