import { db } from "@/lib/db";
import { buildId, ensureSchema, type CategoryRow } from "@/lib/store.shared";

export async function findAllCategories() {
  await ensureSchema();
  const result = await db.query<CategoryRow>(`
    select id, name, created_at::text
    from categories
    order by created_at desc
  `);
  return result.rows;
}

export async function insertCategory(input: { name: string }) {
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

export async function removeCategoryById(id: string) {
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
