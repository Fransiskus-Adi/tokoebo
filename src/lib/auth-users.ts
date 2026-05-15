import { scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

type UserRow = {
  id: number;
  username: string;
  role: string;
};

function verifyScryptPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = scryptSync(password, salt, expected.length);
  return timingSafeEqual(derived, expected);
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash.startsWith("scrypt$")) {
    return verifyScryptPassword(password, storedHash);
  }

  // Backward compatibility for temporary/plaintext records.
  return password === storedHash;
}

async function ensureUsersTable() {
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

export async function authenticateFromDb(username: string, password: string) {
  await ensureUsersTable();

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

  if (result.rowCount && result.rowCount > 0) {
    const user = result.rows[0];
    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }

  // Fallback for scrypt hashes created by local helper script format:
  // scrypt$<saltHex>$<hashHex>
  const scryptResult = await db.query<
    UserRow & {
      password_hash: string;
    }
  >(
    `
      select id, username, role, password_hash
      from public.users
      where username = $1
        and is_active = true
      limit 1
    `,
    [username],
  );

  const scryptUser = scryptResult.rows[0];
  if (!scryptUser) {
    return null;
  }

  if (!verifyPassword(password, scryptUser.password_hash)) {
    return null;
  }

  return {
    id: scryptUser.id,
    username: scryptUser.username,
    role: scryptUser.role,
  };
}
