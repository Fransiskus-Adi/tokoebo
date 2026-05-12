import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { getTransactionById } from "@/lib/store";

type TransactionDetailPageProps = {
  params: Promise<{ id: string }>;
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const { id } = await params;
  const transaction = await getTransactionById(id);

  if (!transaction) notFound();
  const items = transaction.item_details ?? [];
  const subtotal = Math.max(0, Number(transaction.amount) - Number(transaction.delivery_fee));

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-zinc-500">Transaction Detail</p>
        <h1 className="text-2xl font-semibold text-zinc-900">{transaction.id}</h1>
      </header>

      <section className="grid gap-4 rounded-2xl border bg-white p-6 shadow-sm sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Customer</p>
          <p className="mt-1 font-medium text-zinc-900">{transaction.customer_name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Item Bought</p>
          <p className="mt-1 font-medium text-zinc-900">{transaction.item_name || "-"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Status</p>
          <p className="mt-1 font-medium text-zinc-900">{transaction.status}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Amount</p>
          <p className="mt-1 font-medium text-zinc-900">{currency.format(transaction.amount)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Delivery Fee</p>
          <p className="mt-1 font-medium text-zinc-900">{currency.format(transaction.delivery_fee)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Due Date</p>
          <p className="mt-1 font-medium text-zinc-900">{transaction.due_date ?? "-"}</p>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Product Subtotal</h2>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">No product detail found for this transaction.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-zinc-500">
                  <th className="px-2 py-2 font-medium">Product</th>
                  <th className="px-2 py-2 font-medium">Qty</th>
                  <th className="px-2 py-2 font-medium">Unit Price</th>
                  <th className="px-2 py-2 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={`${item.product_id}-${idx}`} className="border-b last:border-0">
                    <td className="px-2 py-3 text-zinc-800">{item.product_name}</td>
                    <td className="px-2 py-3 text-zinc-700">{item.quantity}</td>
                    <td className="px-2 py-3 text-zinc-700">{currency.format(item.unit_price)}</td>
                    <td className="px-2 py-3 font-medium text-zinc-900">{currency.format(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 grid max-w-sm gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Subtotal</span>
            <span className="font-medium text-zinc-900">{currency.format(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Delivery Fee</span>
            <span className="font-medium text-zinc-900">{currency.format(transaction.delivery_fee)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="font-semibold text-zinc-900">Total</span>
            <span className="font-semibold text-zinc-900">{currency.format(transaction.amount)}</span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/transaction/${transaction.id}/invoice/download`}
          className={buttonVariants()}
        >
          Download Invoice
        </Link>
        <Link href="/transaction" className={buttonVariants({ variant: "outline" })}>
          Back to Transaction List
        </Link>
      </div>
    </div>
  );
}
