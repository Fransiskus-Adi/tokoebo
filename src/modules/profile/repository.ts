import { randomBytes, scryptSync } from "node:crypto";
import { db } from "@/lib/db";

export type UserProfileRow = {
  id: number;
  username: string;
  role: string;
  payment_name: string | null;
  payment_bank: string | null;
  payment_account_no: string | null;
};

/** Ensure users table has the payment info columns (idempotent migration). */
export async function ensurePaymentColumns() {
  await db.query(`
    alter table public.users
      add column if not exists payment_name       text,
      add column if not exists payment_bank       text,
      add column if not exists payment_account_no text;
  `);
}

export async function getUserProfileByUsername(username: string): Promise<UserProfileRow | null> {
  await ensurePaymentColumns();

  const result = await db.query<UserProfileRow>(
    `
      select id, username, role,
             payment_name, payment_bank, payment_account_no
      from public.users
      where username = $1 and is_active = true
      limit 1
    `,
    [username],
  );

  return result.rows[0] ?? null;
}

export async function updatePaymentInfo(
  username: string,
  paymentName: string,
  paymentBank: string,
  paymentAccountNo: string,
): Promise<void> {
  await ensurePaymentColumns();

  await db.query(
    `
      update public.users
      set payment_name        = $2,
          payment_bank        = $3,
          payment_account_no  = $4,
          updated_at          = now()
      where username = $1 and is_active = true
    `,
    [username, paymentName, paymentBank, paymentAccountNo],
  );
}

function hashScrypt(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function getPasswordHash(username: string): Promise<string | null> {
  const result = await db.query<{ password_hash: string }>(
    `select password_hash from public.users where username = $1 and is_active = true limit 1`,
    [username],
  );
  return result.rows[0]?.password_hash ?? null;
}

export async function updatePassword(username: string, newPassword: string): Promise<void> {
  const newHash = hashScrypt(newPassword);
  await db.query(
    `update public.users set password_hash = $2, updated_at = now() where username = $1 and is_active = true`,
    [username, newHash],
  );
}
