import { db } from "@/lib/db";

export type TransactionRow = {
  id: string;
  customer_name: string;
  item_name: string;
  item_details: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  amount: number;
  delivery_fee: number;
  status: "Paid" | "Unpaid";
  due_date: string | null;
  created_at: string;
};

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  created_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  created_at: string;
};

let schemaReady = false;

export async function ensureSchema() {
  if (schemaReady) return;

  await db.query(`
    create table if not exists transactions (
      id text primary key,
      customer_name text not null,
      item_name text not null default '',
      item_details jsonb not null default '[]'::jsonb,
      amount numeric(14,2) not null check (amount >= 0),
      delivery_fee numeric(14,2) not null default 0 check (delivery_fee >= 0),
      status text not null default 'Unpaid' check (status in ('Paid', 'Unpaid')),
      due_date date,
      created_at timestamptz not null default now()
    );
  `);
  await db.query(`
    alter table transactions
    add column if not exists item_name text not null default '';
  `);
  await db.query(`
    alter table transactions
    add column if not exists item_details jsonb not null default '[]'::jsonb;
  `);
  await db.query(`
    alter table transactions
    add column if not exists delivery_fee numeric(14,2) not null default 0;
  `);

  await db.query(`
    create table if not exists products (
      id text primary key,
      name text not null,
      category text not null,
      price numeric(14,2) not null check (price >= 0),
      stock integer not null default 0 check (stock >= 0),
      image_url text not null default '',
      created_at timestamptz not null default now()
    );
  `);

  await db.query(`
    alter table products
    add column if not exists image_url text not null default '';
  `);

  await db.query(`
    create table if not exists categories (
      id text primary key,
      name text not null unique,
      created_at timestamptz not null default now()
    );
  `);

  schemaReady = true;
}

export function buildId(prefix: "TRX" | "PRD" | "CAT") {
  const token = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${token}`;
}
