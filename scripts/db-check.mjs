import { config } from "dotenv";
import { Pool } from "pg";

config({ path: ".env.local" });

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in .env.local");
  }

  const pool = new Pool({ connectionString });

  try {
    const result = await pool.query("select current_database() as db, now() as time");
    const row = result.rows[0];
    console.log(`Connected to database: ${row.db}`);
    console.log(`Server time: ${row.time}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  const message = error?.message || String(error);
  const code = error?.code ? ` (code: ${error.code})` : "";
  const host = error?.hostname ? ` host=${error.hostname}` : "";
  console.error(`Database connection failed${code}${host}: ${message}`);
  if (error?.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
