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
  const paymentStatus = String(formData.get("paymentStatus") ?? "Unpaid") as "Paid" | "Unpaid";
  const deliveryStatus = String(formData.get("deliveryStatus") ?? "Pending") as "Pending" | "Delivered";
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

  await createTransaction({
    customerName,
    itemName,
    itemDetails,
    amount,
    deliveryFee,
    paymentStatus,
    deliveryStatus,
    dueDate,
  });
  redirect("/transaction");
}

export default async function NewTransactionPage() {
  const products = await listProducts();

  return (
    <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#f5f1ff_0%,#f8f7ff_42%,#eef8fb_100%)] p-3 shadow-[0_24px_80px_rgba(73,61,112,0.12)] sm:p-5 xl:p-6">
      <div aria-hidden="true" className="absolute -right-24 top-12 -z-10 size-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-20 bottom-20 -z-10 size-64 rounded-full bg-violet-300/20 blur-3xl" />
      <header className="px-1 py-1">
        <p className="text-sm font-medium text-violet-700">Transaction</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Add Transaction</h1>
        <p className="mt-1 text-sm text-slate-600">Catat pesanan baru dan rincian pembayarannya.</p>
      </header>

      <section className="rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl sm:p-6">
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
