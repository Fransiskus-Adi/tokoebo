import { Pool } from "pg";

const rawConnectionString = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;

if (!rawConnectionString) {
  throw new Error(
    "DATABASE_URL (or SUPABASE_DB_URL) is not set. Use your Supabase Postgres connection string.",
  );
}

const connectionString = rawConnectionString
  .trim()
  .replace(/^DATABASE_URL=/i, "")
  .replace(/^SUPABASE_DB_URL=/i, "")
  .replace(/^['"]|['"]$/g, "");

let parsedHostname = "";
try {
  parsedHostname = new URL(connectionString).hostname;
} catch {
  throw new Error(
    "DATABASE_URL is not a valid URI. Use format: postgresql://USER:PASSWORD@HOST:PORT/DB_NAME",
  );
}

if (parsedHostname === "base") {
  throw new Error(
    "DATABASE_URL hostname is 'base', which is invalid. Set DATABASE_URL to your full Supabase/Postgres URI.",
  );
}

const globalForDb = globalThis as unknown as {
  pgPool?: Pool;
};

const isSupabaseHost =
  parsedHostname.endsWith(".supabase.co") ||
  parsedHostname.endsWith(".supabase.com") ||
  parsedHostname.includes("pooler.supabase.com");

export const db =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    ssl: isSupabaseHost
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = db;
}
