import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { InvoiceAutoPrint } from "@/components/invoice-auto-print";
import { getTransactionById } from "@/lib/store";
import { AUTH_COOKIE_NAME, decodeTokenPayload } from "@/lib/auth";
import { getProfile } from "@/modules/profile/controller";

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

  // Fetch transaction and payment profile in parallel
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? decodeTokenPayload(token) : null;
  const username = typeof payload?.sub === "string" ? payload.sub : null;

  const [transaction, profile] = await Promise.all([
    getTransactionById(id),
    username ? getProfile(username) : Promise.resolve(null),
  ]);

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
            <p className="text-xs uppercase tracking-wide text-zinc-500">Payment Status</p>
            <p className="mt-1 font-medium text-zinc-900">{transaction.payment_status}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Delivery Status</p>
            <p className="mt-1 font-medium text-zinc-900">{transaction.delivery_status}</p>
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

        {/* Payment Information */}
        {profile?.payment_name && profile?.payment_bank && profile?.payment_account_no && (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
            <p className="mb-2 font-semibold text-zinc-700">Payment Information</p>
            <p className="text-zinc-800">{profile.payment_name}</p>
            <p className="text-zinc-600">Bank: {profile.payment_bank}</p>
            <p className="text-zinc-600">Account No: {profile.payment_account_no}</p>
          </div>
        )}
      </section>
    </div>
  );
}
