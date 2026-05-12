import Link from "next/link";
import { listProducts, listTransactions } from "@/lib/store";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function Home() {
  const [transactions, products] = await Promise.all([listTransactions(), listProducts()]);

  const unpaidTransactions = transactions
    .filter((item) => item.status === "Unpaid")
    .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    .slice(0, 5);

  const totalRevenue = transactions.reduce((sum, item) => sum + Number(item.amount), 0);
  const paidCount = transactions.filter((item) => item.status === "Paid").length;
  const paidRate = transactions.length > 0 ? (paidCount / transactions.length) * 100 : 0;

  const soldByProduct = new Map<string, { name: string; quantity: number }>();
  for (const trx of transactions) {
    for (const detail of trx.item_details ?? []) {
      const key = detail.product_id || detail.product_name;
      const current = soldByProduct.get(key);
      if (current) current.quantity += Number(detail.quantity) || 0;
      else soldByProduct.set(key, { name: detail.product_name, quantity: Number(detail.quantity) || 0 });
    }
  }
  const bestSelling = [...soldByProduct.values()].sort((a, b) => b.quantity - a.quantity)[0] ?? null;
  const lowStockItems = products.filter((product) => Number(product.stock) < 5).slice(0, 7);

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">Dashboard</p>
          <h1 className="text-2xl font-semibold text-zinc-900">Business Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/transaction/new"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            New Transaction
          </Link>
          <Link
            href="/product/new"
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Add Product
          </Link>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Total Transactions</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{transactions.length}</p>
        </article>
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Total Revenue</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{currency.format(totalRevenue)}</p>
        </article>
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Payment Success Rate</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{paidRate.toFixed(1)}%</p>
        </article>
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Best Selling Product</p>
          <p className="mt-2 truncate text-xl font-semibold text-zinc-900">{bestSelling?.name ?? "-"}</p>
          <p className="mt-1 text-sm text-emerald-600">
            {bestSelling ? `${bestSelling.quantity} items sold` : "No sales data yet"}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Unpaid Transactions</h2>
            <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
              {unpaidTransactions.length} Pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-zinc-500">
                  <th className="px-2 py-2 font-medium">ID</th>
                  <th className="px-2 py-2 font-medium">Customer</th>
                  <th className="px-2 py-2 font-medium">Amount</th>
                  <th className="px-2 py-2 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {unpaidTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-6 text-center text-zinc-500">
                      No unpaid transactions.
                    </td>
                  </tr>
                ) : (
                  unpaidTransactions.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-2 py-3 font-medium text-zinc-800">{item.id}</td>
                      <td className="px-2 py-3 text-zinc-700">{item.customer_name}</td>
                      <td className="px-2 py-3 text-zinc-700">{currency.format(item.amount)}</td>
                      <td className="px-2 py-3 text-zinc-700">{item.due_date ?? "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Low Stock Items</h2>
            <span className="rounded-md bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">Below 5</span>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-zinc-500">No items below stock threshold.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lowStockItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-zinc-800">{item.name}</span>
                  <span className="font-semibold text-rose-700">{item.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Product Snapshot</h2>
          <Link href="/product" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            See all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-zinc-500">
                <th className="px-2 py-2 font-medium">Product</th>
                <th className="px-2 py-2 font-medium">Category</th>
                <th className="px-2 py-2 font-medium">Price</th>
                <th className="px-2 py-2 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 6).map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-2 py-3 font-medium text-zinc-800">{item.name}</td>
                  <td className="px-2 py-3 text-zinc-700">{item.category}</td>
                  <td className="px-2 py-3 text-zinc-700">{currency.format(item.price)}</td>
                  <td className="px-2 py-3 text-zinc-700">{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
