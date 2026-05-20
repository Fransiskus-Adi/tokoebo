import { scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

type UserRow = {
  id: number;
  username: string;
  role: string;
};

type UserWithPasswordHashRow = UserRow & {
  password_hash: string;
};

function verifyScryptPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = scryptSync(password, salt, expected.length);
  return timingSafeEqual(derived, expected);
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash.startsWith("scrypt$")) {
    return verifyScryptPassword(password, storedHash);
  }

  // Backward compatibility for temporary/plaintext records.
  return password === storedHash;
}

export async function ensureUsersTable() {
  await db.query(`create extension if not exists pgcrypto;`);

  await db.query(`
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
}

export async function findActiveUserByCredential(username: string, password: string) {
  const result = await db.query<UserRow>(
    `
      select id, username, role
      from public.users
      where username = $1
        and is_active = true
        and (
          password_hash = $2
          or crypt($2, password_hash) = password_hash
        )
      limit 1
    `,
    [username, password],
  );

  return result.rows[0] ?? null;
}

export async function findActiveUserWithPasswordHash(username: string) {
  const result = await db.query<UserWithPasswordHashRow>(
    `
      select id, username, role, password_hash
      from public.users
      where username = $1
        and is_active = true
      limit 1
    `,
    [username],
  );

  return result.rows[0] ?? null;
}
