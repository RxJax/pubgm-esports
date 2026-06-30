import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    const dbUrl = process.env.DATABASE_URL || "";
    
    // SQLite uses file: connection protocols
    const isSqlite = !dbUrl || dbUrl.startsWith("file:");

    if (isSqlite) {
      // Dynamically import SQLite packages only when needed.
      // This prevents serverless platform crashes where native binary bindings are unavailable.
      const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
      const path = require("path");
      
      const dbPath = dbUrl ? dbUrl.replace("file:", "") : path.resolve(process.cwd(), "dev.db");
      
      const adapter = new PrismaBetterSqlite3({
        url: `file:${dbPath}`,
      });
      
      return new PrismaClient({ adapter });
    }

    // For production remote PostgreSQL database (Supabase pooler)
    // Prisma 7 requires passing a driver adapter for direct connection client setups
    const { PrismaPg } = require("@prisma/adapter-pg");
    const { Pool } = require("pg");

    const pool = new Pool({
      connectionString: dbUrl,
      max: 10, // Optimizes connection pooling under concurrent global traffic
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({ adapter });
  })();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
export const revalidate = 0;
