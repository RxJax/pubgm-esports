import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

let _prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (_prisma) return _prisma;
  if (globalForPrisma.prisma) {
    _prisma = globalForPrisma.prisma;
    return _prisma;
  }

  const dbUrlRaw = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
  let dbUrl = dbUrlRaw;
  // Strip surrounding quotes if present (common copy-paste issue on Vercel)
  if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
    dbUrl = dbUrl.slice(1, -1);
  } else if (dbUrl.startsWith("'") && dbUrl.endsWith("'")) {
    dbUrl = dbUrl.slice(1, -1);
  }

  // Securely mask database URL for diagnostics
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":*****@");
  console.log(`[Diagnostic] Database Client Initialization:
    - Raw URL length: ${dbUrlRaw.length}
    - Cleaned URL length: ${dbUrl.length}
    - Masked URL: ${maskedUrl}
    - Surrounding quotes stripped: ${dbUrlRaw !== dbUrl}
    - Protocol: ${dbUrl.split(":")[0]}
  `);

  const pool = new Pool({
    connectionString: dbUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: dbUrl.includes("supabase.co") || dbUrl.includes("supabase.com") || dbUrl.includes("pooler.supabase.com")
      ? { rejectUnauthorized: false }
      : undefined,
  });
  
  const adapter = new PrismaPg(pool);
  _prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = _prisma;
  }

  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export const revalidate = 0;
