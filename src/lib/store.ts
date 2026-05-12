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

async function ensureSchema() {
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

function buildId(prefix: "TRX" | "PRD" | "CAT") {
  const token = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${token}`;
}

export async function listTransactions() {
  await ensureSchema();
  const result = await db.query<TransactionRow>(`
    select id, customer_name, item_name, item_details, amount, delivery_fee, status, due_date::text, created_at::text
    from transactions
    order by created_at desc
  `);
  return result.rows;
}

export async function listProducts() {
  await ensureSchema();
  const result = await db.query<ProductRow>(`
    select id, name, category, price, stock, image_url, created_at::text
    from products
    order by created_at desc
  `);
  return result.rows;
}

export async function listCategories() {
  await ensureSchema();
  const result = await db.query<CategoryRow>(`
    select id, name, created_at::text
    from categories
    order by created_at desc
  `);
  return result.rows;
}

export async function getTransactionById(id: string) {
  await ensureSchema();
  const result = await db.query<TransactionRow>(
    `
      select id, customer_name, item_name, amount, delivery_fee, status, due_date::text, created_at::text
      , item_details
      from transactions
      where id = $1
      limit 1
    `,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function getProductById(id: string) {
  await ensureSchema();
  const result = await db.query<ProductRow>(
    `
      select id, name, category, price, stock, created_at::text
      , image_url
      from products
      where id = $1
      limit 1
    `,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function createTransaction(input: {
  customerName: string;
  itemName: string;
  itemDetails: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  amount: number;
  deliveryFee: number;
  status: "Paid" | "Unpaid";
  dueDate: string | null;
}) {
  await ensureSchema();
  const id = buildId("TRX");
  await db.query(
    `
      insert into transactions (id, customer_name, item_name, item_details, amount, delivery_fee, status, due_date)
      values ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)
    `,
    [
      id,
      input.customerName,
      input.itemName,
      JSON.stringify(input.itemDetails),
      input.amount,
      input.deliveryFee,
      input.status,
      input.dueDate,
    ],
  );
  return id;
}

export async function getProductsByIds(ids: string[]) {
  await ensureSchema();
  if (ids.length === 0) return [];

  const result = await db.query<Pick<ProductRow, "id" | "name" | "price">>(
    `
      select id, name, price
      from products
      where id = any($1::text[])
    `,
    [ids],
  );
  return result.rows;
}

export async function createProduct(input: {
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
}) {
  await ensureSchema();
  const id = buildId("PRD");
  await db.query(
    `
      insert into products (id, name, category, price, stock, image_url)
      values ($1, $2, $3, $4, $5, $6)
    `,
    [id, input.name, input.category, input.price, input.stock, input.imageUrl],
  );
  return id;
}

export async function createCategory(input: { name: string }) {
  await ensureSchema();
  const id = buildId("CAT");
  await db.query(
    `
      insert into categories (id, name)
      values ($1, $2)
      on conflict (name) do nothing
    `,
    [id, input.name],
  );
  return id;
}

export async function deleteTransactionById(id: string) {
  await ensureSchema();
  const result = await db.query(
    `
      delete from transactions
      where id = $1
    `,
    [id],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deleteProductById(id: string) {
  await ensureSchema();
  const result = await db.query(
    `
      delete from products
      where id = $1
    `,
    [id],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deleteCategoryById(id: string) {
  await ensureSchema();
  const result = await db.query(
    `
      delete from categories
      where id = $1
    `,
    [id],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function updateTransactionStatusById(id: string, status: "Paid" | "Unpaid") {
  await ensureSchema();
  const result = await db.query(
    `
      update transactions
      set status = $2
      where id = $1
    `,
    [id, status],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function updateProductById(
  id: string,
  input: {
    name: string;
    category: string;
    price: number;
    stock: number;
    imageUrl?: string;
  },
) {
  const nextImageUrl = input.imageUrl ?? null;

  await ensureSchema();
  const result = await db.query(
    `
      update products
      set name = $2,
          category = $3,
          price = $4,
          stock = $5,
          image_url = coalesce($6, image_url)
      where id = $1
    `,
    [id, input.name, input.category, input.price, input.stock, nextImageUrl],
  );

  return (result.rowCount ?? 0) > 0;
}
