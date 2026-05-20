import { db } from "@/lib/db";
import { buildId, ensureSchema, type ProductRow } from "@/lib/store.shared";

export async function findAllProducts() {
  await ensureSchema();
  const result = await db.query<ProductRow>(`
    select id, name, category, price, stock, image_url, created_at::text
    from products
    order by created_at desc
  `);
  return result.rows;
}

export async function findProductById(id: string) {
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

export async function findProductsByIds(ids: string[]) {
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

export async function insertProduct(input: {
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

export async function removeProductById(id: string) {
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

export async function updateProductRecordById(
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
