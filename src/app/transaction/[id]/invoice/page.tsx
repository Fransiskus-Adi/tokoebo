import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { InvoiceAutoPrint } from "@/components/invoice-auto-print";
import { getTransactionById } from "@/lib/store";

export const dynamic = "force-dynamic";

type InvoicePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function TransactionInvoicePage({ params, searchParams }: InvoicePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const transaction = await getTransactionById(id);

  if (!transaction) notFound();

  const shouldAutoPrint = query.mode === "print" || query.mode === "download";

  return (
    <div className="mx-auto w-full max-w-3xl p-6 print:p-0">
      <InvoiceAutoPrint enabled={shouldAutoPrint} />

      <div className="mb-4 flex gap-3 print:hidden">
        <Link
          href={`/transaction/${transaction.id}/invoice?mode=print`}
          className={buttonVariants()}
        >
          Print / Save PDF
        </Link>
        <Link href={`/transaction/${transaction.id}`} className={buttonVariants({ variant: "outline" })}>
          Back to Detail
        </Link>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm print:rounded-none print:border-0 print:shadow-none">
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <p className="text-sm text-zinc-500">Invoice</p>
            <h1 className="text-2xl font-semibold text-zinc-900">{transaction.id}</h1>
          </div>
          <div className="text-right text-sm text-zinc-600">
            <p>Toko Ebo</p>
            <p>{new Date(transaction.created_at).toLocaleDateString("id-ID")}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Customer</p>
            <p className="mt-1 font-medium text-zinc-900">{transaction.customer_name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Status</p>
            <p className="mt-1 font-medium text-zinc-900">{transaction.status}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Items</p>
            <p className="mt-1 font-medium text-zinc-900">{transaction.item_name || "-"}</p>
          </div>
        </div>

        <div className="mt-8 space-y-2 border-t pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Delivery Fee</span>
            <span className="font-medium text-zinc-900">{currency.format(transaction.delivery_fee)}</span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="font-semibold text-zinc-900">Total</span>
            <span className="font-semibold text-zinc-900">{currency.format(transaction.amount)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
