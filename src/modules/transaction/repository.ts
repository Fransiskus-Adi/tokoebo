import { db } from "@/lib/db";
import { buildId, ensureSchema, type TransactionRow } from "@/lib/store.shared";

export async function findAllTransactions() {
  await ensureSchema();
  const result = await db.query<TransactionRow>(`
    select id, customer_name, item_name, item_details, amount, delivery_fee, status, due_date::text, created_at::text
    from transactions
    order by created_at desc
  `);
  return result.rows;
}

export async function findTransactionById(id: string) {
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

export async function insertTransaction(input: {
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

export async function removeTransactionById(id: string) {
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

export async function updateTransactionStatusByIdRecord(id: string, status: "Paid" | "Unpaid") {
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
