import { randomBytes, scryptSync } from "node:crypto";
import { config } from "dotenv";
import { Pool } from "pg";

const target = (process.argv[2] || "dev").toLowerCase();
const username = process.argv[3];
const password = process.argv[4];

if (!username || !password) {
  console.error("Usage: node scripts/db-create-user.mjs <dev|prod> <username> <password>");
  process.exit(1);
}

const envFile =
  target === "prod" || target === "production"
    ? ".env.production.local"
    : ".env.development.local";

config({ path: envFile, quiet: true });

function hashPassword(rawPassword) {
  const salt = randomBytes(16);
  const hash = scryptSync(rawPassword, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

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

    const passwordHash = hashPassword(password);
    await pool.query(
      `
        insert into public.users (username, password_hash, role, is_active)
        values ($1, $2, 'admin', true)
        on conflict (username)
        do update
        set password_hash = excluded.password_hash,
            is_active = true,
            updated_at = now()
      `,
      [username, passwordHash],
    );

    console.log(`Using env file: ${envFile}`);
    console.log(`User upserted: ${username}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  const message = error?.message || String(error);
  console.error(`Create user failed: ${message}`);
  process.exit(1);
});

