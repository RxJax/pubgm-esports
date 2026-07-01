import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

async function testLiveConn() {
  const dbUrl = process.env.DATABASE_URL;
  console.log(`Testing DATABASE_URL from .env: "${dbUrl}"...`);
  
  if (!dbUrl) {
    console.error("DATABASE_URL is not set in environment!");
    return;
  }
  
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000
  });
  
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT 1 as connected");
    console.log("\n🎉 CONNECTION SUCCESSFUL! Query result:", res.rows);
    client.release();
  } catch (err: any) {
    console.error("\n❌ CONNECTION FAILED:", err.message);
  } finally {
    await pool.end();
  }
}

testLiveConn();
