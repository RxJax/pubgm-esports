import { Pool } from "pg";

const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "ap-southeast-1", "ap-southeast-2", "ap-southeast-3", "ap-southeast-4",
  "ap-northeast-1", "ap-northeast-2", "ap-northeast-3",
  "ap-south-1", "ap-east-1",
  "eu-west-1", "eu-west-2", "eu-west-3",
  "eu-central-1", "eu-central-2", "eu-south-1", "eu-south-2",
  "ca-central-1", "ca-west-1",
  "sa-east-1", "me-central-1", "me-south-1", "af-south-1", "il-central-1"
];

async function testPoolDirect() {
  console.log("Testing direct pg Pool connection across ALL potential regions...");
  
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    
    const pool = new Pool({
      host,
      port: 6543,
      user: "postgres.nqwsypeanaafhcafaoog",
      password: "tamakpata101@",
      database: "postgres",
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 4000
    });
    
    try {
      const client = await pool.connect();
      const res = await client.query("SELECT 1");
      console.log(`\n🎉 SUCCESS! Connected directly to ${region} on port 6543! Query result:`, res.rows);
      client.release();
      await pool.end();
      break;
    } catch (err: any) {
      await pool.end().catch(() => {});
      const msg = err.message.trim();
      if (msg.includes("getaddrinfo ENOTFOUND")) {
        // Host does not exist
      } else {
        console.log(`-> Region ${region} response: ${msg.substring(0, 150)}`);
      }
    }
  }
}

testPoolDirect();
