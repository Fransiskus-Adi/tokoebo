import { redirect } from "next/navigation";
import { TransactionCreateForm } from "@/components/transaction-create-form";
import { createTransaction, getProductsByIds, listProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

async function createTransactionAction(formData: FormData) {
  "use server";

  const customerName = String(formData.get("customerName") ?? "").trim();
  const productIds = formData.getAll("productIds").map((value) => String(value));
  const quantities = formData.getAll("quantities").map((value) => Number(value));
  const deliveryFee = Number(formData.get("deliveryFee") ?? 0);
  const status = String(formData.get("status") ?? "Unpaid") as "Paid" | "Unpaid";
  const dueDate = String(formData.get("dueDate") ?? "").trim() || null;

  if (
    !customerName ||
    productIds.length === 0 ||
    productIds.length !== quantities.length ||
    Number.isNaN(deliveryFee) ||
    deliveryFee < 0 ||
    quantities.some((qty) => Number.isNaN(qty) || qty <= 0)
  ) {
    throw new Error("Invalid transaction data.");
  }

  const selectedProducts = await getProductsByIds(productIds);
  if (selectedProducts.length === 0) {
    throw new Error("No valid products selected.");
  }

  const quantityByProductId = new Map<string, number>();
  productIds.forEach((productId, index) => {
    quantityByProductId.set(productId, quantities[index] ?? 1);
  });

  const subtotal = selectedProducts.reduce((sum, product) => {
    const qty = quantityByProductId.get(product.id) ?? 1;
    return sum + Number(product.price) * qty;
  }, 0);
  const amount = subtotal + deliveryFee;
  const itemDetails = selectedProducts.map((product) => {
    const quantity = quantityByProductId.get(product.id) ?? 1;
    const unitPrice = Number(product.price);
    return {
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: unitPrice,
      subtotal: unitPrice * quantity,
    };
  });
  const itemName = selectedProducts
    .map((product) => `${product.name} x${quantityByProductId.get(product.id) ?? 1}`)
    .join(", ");

  await createTransaction({ customerName, itemName, itemDetails, amount, deliveryFee, status, dueDate });
  redirect("/transaction");
}

export default async function NewTransactionPage() {
  const products = await listProducts();

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-zinc-500">Transaction</p>
        <h1 className="text-2xl font-semibold text-zinc-900">Add Transaction</h1>
      </header>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <TransactionCreateForm
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price),
          }))}
          onSubmit={createTransactionAction}
        />
      </section>
    </div>
  );
}
