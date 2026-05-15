import { config } from "dotenv";
import { Pool } from "pg";

const target = (process.argv[2] || "dev").toLowerCase();
const envFile =
  target === "prod" || target === "production"
    ? ".env.production.local"
    : ".env.development.local";

config({ path: envFile, quiet: true });

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(`DATABASE_URL is not set in ${envFile}`);
  }

  const pool = new Pool({ connectionString });

  try {
    await pool.query(`
      create table if not exists public.users (
        id bigserial primary key,
        username text not null unique,
        password_hash text not null,
        role text not null default 'staff',
        is_active boolean not null default true,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `);

    await pool.query(`
      create index if not exists users_username_idx on public.users (username);
    `);

    console.log(`Using env file: ${envFile}`);
    console.log("Table ensured: public.users");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  const message = error?.message || String(error);
  const code = error?.code ? ` (code: ${error.code})` : "";
  const host = error?.hostname ? ` host=${error.hostname}` : "";
  console.error(`Create users table failed${code}${host}: ${message}`);
  if (error?.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});

