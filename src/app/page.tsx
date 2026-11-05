import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  Boxes,
  CircleDollarSign,
  PackageSearch,
  ReceiptText,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { listProducts, listTransactions } from "@/lib/store";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const monthLabel = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  timeZone: "UTC",
});

const jakartaMonthParts = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "numeric",
  timeZone: "Asia/Jakarta",
});

const dateLabel = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const glassCard =
  "rounded-3xl border border-white/70 bg-white/55 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl";

function getMonthKey(date: Date) {
  const parts = jakartaMonthParts.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value.padStart(2, "0") ?? "";
  return `${year}-${month}`;
}

function getLastSixMonths(now = new Date()) {
  const parts = jakartaMonthParts.formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 6 + index, 1));
    return {
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      label: monthLabel.format(date),
      value: 0,
    };
  });
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Banknote;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className={`${glassCard} p-5`}>
      <div className="mb-5 flex items-start justify-between">
        <span className="grid size-10 place-items-center rounded-2xl bg-white/75 text-violet-700 shadow-sm">
          <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </span>
        <span className="size-2 rounded-full bg-violet-400/70" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-950" title={value}>
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

export default async function Home() {
  const [transactions, products] = await Promise.all([listTransactions(), listProducts()]);

  const paidTransactions = transactions.filter((item) => item.payment_status === "Paid");
  const unpaidTransactions = transactions.filter((item) => item.payment_status === "Unpaid");
  const paidRevenue = paidTransactions.reduce((sum, item) => sum + Number(item.amount), 0);
  const unpaidValue = unpaidTransactions.reduce((sum, item) => sum + Number(item.amount), 0);
  const paidRate = transactions.length > 0 ? (paidTransactions.length / transactions.length) * 100 : 0;
  const deliveredCount = transactions.filter((item) => item.delivery_status === "Delivered").length;
  const deliveryRate = transactions.length > 0 ? (deliveredCount / transactions.length) * 100 : 0;
  const uniqueCustomers = new Set(
    transactions.map((item) => item.customer_name.trim().toLocaleLowerCase("id-ID")).filter(Boolean),
  ).size;

  const soldByProduct = new Map<string, { name: string; quantity: number }>();
  for (const transaction of transactions) {
    for (const detail of transaction.item_details ?? []) {
      const key = detail.product_id || detail.product_name;
      const current = soldByProduct.get(key);
      if (current) current.quantity += Number(detail.quantity) || 0;
      else {
        soldByProduct.set(key, {
          name: detail.product_name,
          quantity: Number(detail.quantity) || 0,
        });
      }
    }
  }

  const bestSelling = [...soldByProduct.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 4);
  const lowStockItems = products
    .filter((product) => Number(product.stock) < 5)
    .sort((a, b) => Number(a.stock) - Number(b.stock))
    .slice(0, 5);

  const monthlyRevenue = getLastSixMonths();
  const revenueByMonth = new Map(monthlyRevenue.map((month) => [month.key, month]));
  for (const transaction of paidTransactions) {
    const month = revenueByMonth.get(getMonthKey(new Date(transaction.created_at)));
    if (month) month.value += Number(transaction.amount);
  }
  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((month) => month.value), 1);

  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#f5f1ff_0%,#f8f7ff_38%,#eef8fb_72%,#fceeea_100%)] p-3 shadow-[0_24px_80px_rgba(73,61,112,0.12)] sm:p-5 xl:p-6">
      <div aria-hidden="true" className="absolute -left-24 bottom-0 -z-10 size-80 rounded-full bg-rose-300/30 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-20 top-24 -z-10 size-80 rounded-full bg-cyan-300/25 blur-3xl" />
      <div aria-hidden="true" className="absolute left-1/3 top-1/2 -z-10 size-72 rounded-full bg-violet-300/25 blur-3xl" />

      <header className="mb-5 flex flex-col gap-4 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-violet-700">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Ringkasan bisnis</h1>
          <p className="mt-1 text-sm text-slate-600">Pantau penjualan, pembayaran, dan stok Eboo Bakery.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/product/new" className="rounded-xl border border-white/80 bg-white/65 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">
            Tambah produk
          </Link>
          <Link href="/transaction/new" className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
            Transaksi baru
          </Link>
        </div>
      </header>

      <section aria-label="Ringkasan utama" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Banknote} label="Omzet lunas" value={currency.format(paidRevenue)} detail={`${paidTransactions.length} transaksi sudah dibayar`} />
        <MetricCard icon={ReceiptText} label="Total transaksi" value={transactions.length.toLocaleString("id-ID")} detail={`${uniqueCustomers.toLocaleString("id-ID")} pelanggan unik`} />
        <MetricCard icon={CircleDollarSign} label="Tagihan tertunda" value={currency.format(unpaidValue)} detail={`${unpaidTransactions.length} transaksi belum lunas`} />
        <MetricCard icon={PackageSearch} label="Stok menipis" value={lowStockItems.length.toLocaleString("id-ID")} detail="Produk dengan stok di bawah 5" />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.8fr)]">
        <article className={`${glassCard} min-h-[390px] p-5 sm:p-6`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Omzet transaksi lunas</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">Penjualan 6 bulan terakhir</h2>
            </div>
            <span className="w-fit rounded-full border border-violet-200/70 bg-violet-100/70 px-3 py-1 text-xs font-semibold text-violet-700">Zona waktu Jakarta</span>
          </div>

          <div className="mt-8 grid h-60 grid-cols-6 items-end gap-2 border-b border-slate-300/60 sm:gap-4">
            {monthlyRevenue.map((month) => {
              const height = month.value > 0 ? Math.max((month.value / maxMonthlyRevenue) * 100, 8) : 3;
              return (
                <div key={month.key} className="flex h-full min-w-0 flex-col justify-end gap-2 text-center">
                  <span className="truncate text-[10px] font-medium text-slate-500 sm:text-xs">{compactCurrency.format(month.value)}</span>
                  <div role="img" aria-label={`${month.label}: ${currency.format(month.value)}`} title={`${month.label}: ${currency.format(month.value)}`} className="min-h-1 rounded-t-2xl bg-[linear-gradient(180deg,#8067d8_0%,#a998eb_100%)] shadow-[0_10px_24px_rgba(112,89,196,0.22)]" style={{ height: `${height}%` }} />
                  <span className="pb-2 text-xs capitalize text-slate-600">{month.label}</span>
                </div>
              );
            })}
          </div>
        </article>

        <article className={`${glassCard} flex min-h-[390px] flex-col p-5 sm:p-6`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Pembayaran</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">Success rate</h2>
            </div>
            <span className="grid size-10 place-items-center rounded-full bg-white/75 text-violet-700 shadow-sm">
              <ArrowUpRight aria-hidden="true" className="size-5" />
            </span>
          </div>

          <div className="relative mx-auto mt-6 grid size-48 place-items-center">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
              <circle cx="50" cy="50" r="41" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="9" />
              <circle cx="50" cy="50" r="41" fill="none" pathLength="100" stroke="url(#payment-gradient)" strokeDasharray="100" strokeDashoffset={100 - paidRate} strokeLinecap="round" strokeWidth="9" />
              <defs>
                <linearGradient id="payment-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6d55c7" />
                  <stop offset="100%" stopColor="#b49ff1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <p className="text-3xl font-semibold tracking-tight text-slate-950">{paidRate.toFixed(1)}%</p>
              <p className="mt-1 text-xs text-slate-500">sudah lunas</p>
            </div>
          </div>

          <p className="mt-auto text-center text-sm leading-6 text-slate-600">{paidTransactions.length} dari {transactions.length} transaksi telah dibayar.</p>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <article className={`${glassCard} p-5 sm:p-6`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Aktivitas terbaru</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">Transaksi terbaru</h2>
            </div>
            <Link href="/transaction" className="text-sm font-semibold text-violet-700 hover:text-violet-900">Lihat semua</Link>
          </div>

          {transactions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300/70 p-8 text-center text-sm text-slate-500">Belum ada transaksi.</p>
          ) : (
            <div className="divide-y divide-white/70">
              {transactions.slice(0, 5).map((transaction) => (
                <Link key={transaction.id} href={`/transaction/${transaction.id}`} className="grid gap-2 py-3 transition hover:translate-x-0.5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{transaction.customer_name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{dateLabel.format(new Date(transaction.created_at))}</p>
                  </div>
                  <span className={transaction.payment_status === "Paid" ? "w-fit rounded-full bg-emerald-100/80 px-2.5 py-1 text-xs font-semibold text-emerald-700" : "w-fit rounded-full bg-amber-100/80 px-2.5 py-1 text-xs font-semibold text-amber-700"}>
                    {transaction.payment_status === "Paid" ? "Lunas" : "Belum lunas"}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{currency.format(transaction.amount)}</span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <div className="grid gap-4">
          <article className={`${glassCard} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pengiriman</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Delivery progress</h2>
              </div>
              <Truck aria-hidden="true" className="size-5 text-violet-700" />
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/75" role="img" aria-label={`${deliveryRate.toFixed(1)}% transaksi sudah dikirim`}>
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#755ccf,#aa95ec)]" style={{ width: `${deliveryRate}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>{deliveredCount} terkirim</span>
              <span>{transactions.length - deliveredCount} pending</span>
            </div>
          </article>

          <article className={`${glassCard} p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Berdasarkan jumlah item</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Produk terlaris</h2>
              </div>
              <ShoppingBag aria-hidden="true" className="size-5 text-violet-700" />
            </div>
            {bestSelling.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada data penjualan.</p>
            ) : (
              <ol className="space-y-3">
                {bestSelling.map((product, index) => (
                  <li key={product.name} className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/75 text-xs font-bold text-violet-700">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{product.name}</span>
                    <span className="text-xs font-semibold text-slate-500">{product.quantity} item</span>
                  </li>
                ))}
              </ol>
            )}
          </article>
        </div>
      </section>

      <section className={`${glassCard} mt-4 p-5 sm:p-6`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Perlu restock</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Stok menipis</h2>
          </div>
          <Boxes aria-hidden="true" className="size-5 text-violet-700" />
        </div>
        {lowStockItems.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300/70 p-6 text-center text-sm text-slate-500">Semua stok masih aman.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {lowStockItems.map((product) => (
              <li key={product.id} className="rounded-2xl border border-white/80 bg-white/45 p-4">
                <p className="truncate text-sm font-semibold text-slate-800">{product.name}</p>
                <p className="mt-2 text-2xl font-semibold text-rose-600">{product.stock}</p>
                <p className="text-xs text-slate-500">stok tersisa</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
