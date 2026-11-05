import Link from "next/link";
import { notFound } from "next/navigation";
import { getTransactionById } from "@/lib/store";

export const dynamic = "force-dynamic";

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
    <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#f5f1ff_0%,#f8f7ff_42%,#eef8fb_100%)] p-3 shadow-[0_24px_80px_rgba(73,61,112,0.12)] sm:p-5 xl:p-6">
      <div aria-hidden="true" className="absolute -right-24 top-12 -z-10 size-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-20 bottom-20 -z-10 size-64 rounded-full bg-violet-300/20 blur-3xl" />
      <header className="px-1 py-1">
        <p className="text-sm font-medium text-violet-700">Transaction Detail</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{transaction.id}</h1>
        <p className="mt-1 text-sm text-slate-600">Rincian pelanggan, pembayaran, dan pengiriman.</p>
      </header>

      <section className="grid gap-4 rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl sm:grid-cols-2 sm:p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Customer</p>
          <p className="mt-1 font-medium text-zinc-900">{transaction.customer_name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Item Bought</p>
          <p className="mt-1 font-medium text-zinc-900">{transaction.item_name || "-"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Payment Status</p>
          <p className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${transaction.payment_status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{transaction.payment_status}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Delivery Status</p>
          <p className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${transaction.delivery_status === "Delivered" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-700"}`}>{transaction.delivery_status}</p>
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

      <section className="rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Product Subtotal</h2>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">No product detail found for this transaction.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-violet-100 text-slate-500">
                  <th className="px-2 py-2 font-medium">Product</th>
                  <th className="px-2 py-2 font-medium">Qty</th>
                  <th className="px-2 py-2 font-medium">Unit Price</th>
                  <th className="px-2 py-2 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={`${item.product_id}-${idx}`} className="border-b border-white/80 last:border-0">
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
          <div className="flex items-center justify-between border-t border-violet-100 pt-2">
            <span className="font-semibold text-zinc-900">Total</span>
            <span className="font-semibold text-zinc-900">{currency.format(transaction.amount)}</span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/transaction/${transaction.id}/invoice/download`}
          className="inline-flex h-11 items-center rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-800"
        >
          Download Invoice
        </Link>
        <Link href="/transaction" className="inline-flex h-11 items-center rounded-xl border border-white/90 bg-white/65 px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-white hover:text-violet-700">
          Back to Transaction List
        </Link>
      </div>
    </div>
  );
}
