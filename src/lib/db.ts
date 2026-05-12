import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL (or SUPABASE_DB_URL) is not set. Use your Supabase Postgres connection string.",
  );
}

let parsedHostname = "";
try {
  parsedHostname = new URL(connectionString).hostname;
} catch {
  throw new Error("DATABASE_URL is not a valid connection string URI.");
}

if (parsedHostname === "base") {
  throw new Error(
    "DATABASE_URL hostname is 'base', which is invalid. Set DATABASE_URL to your full Supabase/Postgres URI.",
  );
}

const globalForDb = globalThis as unknown as {
  pgPool?: Pool;
};

export const db =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    ssl: connectionString.includes("supabase.co")
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = db;
}
