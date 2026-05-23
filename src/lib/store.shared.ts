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
  payment_status: "Paid" | "Unpaid";
  delivery_status: "Pending" | "Delivered";
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
      payment_status text not null default 'Unpaid' check (payment_status in ('Paid', 'Unpaid')),
      delivery_status text not null default 'Pending' check (delivery_status in ('Pending', 'Delivered')),
      due_date date,
      created_at timestamptz not null default now()
    );
  `);
  await db.query(`
    do $$
    begin
      if exists (
        select 1
        from information_schema.columns
        where table_name = 'transactions'
          and column_name = 'status'
      ) and not exists (
        select 1
        from information_schema.columns
        where table_name = 'transactions'
          and column_name = 'payment_status'
      ) then
        alter table transactions rename column status to payment_status;
      end if;
    end $$;
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
    alter table transactions
    add column if not exists payment_status text not null default 'Unpaid';
  `);
  await db.query(`
    alter table transactions
    add column if not exists delivery_status text not null default 'Pending';
  `);
  await db.query(`
    update transactions
    set payment_status = coalesce(payment_status, 'Unpaid')
    where payment_status is null;
  `);
  await db.query(`
    update transactions
    set delivery_status = coalesce(delivery_status, 'Pending')
    where delivery_status is null;
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
