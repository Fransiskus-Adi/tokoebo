import Link from "next/link";
import { revalidatePath } from "next/cache";
import { MoreHorizontal } from "lucide-react";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { DismissibleMenuGroup } from "@/components/dismissible-menu-group";
import {
  deleteTransactionById,
  listTransactions,
  updateTransactionDeliveryStatusById,
  updateTransactionStatusById,
} from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function TransactionPage() {
  async function handleDelete(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await deleteTransactionById(id);
    revalidatePath("/transaction");
  }

  async function handleApprove(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await updateTransactionStatusById(id, "Paid");
    revalidatePath("/transaction");
  }

  async function handleMarkDelivered(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await updateTransactionDeliveryStatusById(id, "Delivered");
    revalidatePath("/transaction");
  }

  const transactions = await listTransactions();
  const unpaidTransactions = transactions.filter((item) => item.payment_status === "Unpaid").length;
  const paidTransactions = transactions.filter((item) => item.payment_status === "Paid").length;
  const pendingDeliveries = transactions.filter((item) => item.delivery_status === "Pending").length;
  const deliveredTransactions = transactions.filter((item) => item.delivery_status === "Delivered").length;

  return (
    <div className="relative isolate flex min-w-0 flex-col gap-5 overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#f5f1ff_0%,#f8f7ff_42%,#eef8fb_100%)] p-3 shadow-[0_24px_80px_rgba(73,61,112,0.12)] sm:p-5 lg:h-[calc(100dvh-5.5rem)] xl:p-6">
      <div aria-hidden="true" className="absolute -right-24 top-12 -z-10 size-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-20 bottom-20 -z-10 size-64 rounded-full bg-violet-300/20 blur-3xl" />
      <header className="px-1 py-1">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-violet-700">Transaction</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Transaction Management</h1>
            <p className="mt-1 text-sm text-slate-600">Pantau pembayaran, pesanan, dan status pengiriman.</p>
          </div>
          <Link href="/transaction/new" className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
            + Add Transaction
          </Link>
        </div>
      </header>

      <section aria-label="Ringkasan transaksi" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="aspect-square rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.08)] backdrop-blur-xl sm:aspect-auto sm:min-h-28">
          <div className="flex h-full flex-col justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unpaid</p>
            <p className="mt-2 text-2xl font-semibold text-amber-700">{unpaidTransactions}</p>
          </div>
        </div>
        <div className="aspect-square rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.08)] backdrop-blur-xl sm:aspect-auto sm:min-h-28">
          <div className="flex h-full flex-col justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paid</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{paidTransactions}</p>
          </div>
        </div>
        <div className="aspect-square rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.08)] backdrop-blur-xl sm:aspect-auto sm:min-h-28">
          <div className="flex h-full flex-col justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Delivery</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-700">{pendingDeliveries}</p>
          </div>
        </div>
        <div className="aspect-square rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.08)] backdrop-blur-xl sm:aspect-auto sm:min-h-28">
          <div className="flex h-full flex-col justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Delivered</p>
            <p className="mt-2 text-2xl font-semibold text-sky-700">{deliveredTransactions}</p>
          </div>
        </div>
      </section>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Transaction List</h2>
        <DismissibleMenuGroup className="min-h-0 w-full max-w-full flex-1 overflow-auto touch-pan-x">
          <table className="w-full min-w-[920px] text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-[#f8fbfd]">
              <tr className="border-b border-violet-100 text-slate-500">
                <th className="px-2 py-2 font-medium">ID</th>
                <th className="px-2 py-2 font-medium">Customer</th>
                <th className="px-2 py-2 font-medium">Item Bought</th>
                <th className="px-2 py-2 font-medium">Amount</th>
                <th className="px-2 py-2 font-medium">Payment Status</th>
                <th className="px-2 py-2 font-medium">Delivery Status</th>
                <th className="px-2 py-2 font-medium">Date</th>
                <th className="sticky right-0 z-20 min-w-[184px] border-l border-violet-100 bg-[#f7f7fc] px-3 py-2 text-right font-medium shadow-[-14px_0_24px_-20px_rgba(76,65,120,0.55)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-2 py-6 text-center text-zinc-500">
                    No transactions yet. Click Add Transaction to create one.
                  </td>
                </tr>
              ) : (
                transactions.map((item) => (
                    <tr key={item.id} className="border-b border-white/80 transition hover:bg-white/35 last:border-0">
                    <td className="px-2 py-3 font-medium">
                      <Link
                        href={`/transaction/${item.id}`}
                        className="block rounded px-1 py-1 text-zinc-900 transition hover:bg-zinc-100"
                      >
                        {item.id}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-zinc-700">
                      <Link
                        href={`/transaction/${item.id}`}
                        className="block rounded px-1 py-1 transition hover:bg-zinc-100"
                      >
                        {item.customer_name}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-zinc-700">
                      <Link
                        href={`/transaction/${item.id}`}
                        className="block rounded px-1 py-1 transition hover:bg-zinc-100"
                      >
                        {item.item_name || "-"}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-zinc-700">
                      <Link
                        href={`/transaction/${item.id}`}
                        className="block rounded px-1 py-1 transition hover:bg-zinc-100"
                      >
                        {currency.format(item.amount)}
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      <Link
                        href={`/transaction/${item.id}`}
                        className="block rounded px-1 py-1 transition hover:bg-zinc-100"
                      >
                        <span
                          className={
                            item.payment_status === "Paid"
                              ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                              : "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
                          }
                        >
                          {item.payment_status}
                        </span>
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      <Link
                        href={`/transaction/${item.id}`}
                        className="block rounded px-1 py-1 transition hover:bg-zinc-100"
                      >
                        <span
                          className={
                            item.delivery_status === "Delivered"
                              ? "rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700"
                              : "rounded-full bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700"
                          }
                        >
                          {item.delivery_status}
                        </span>
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-zinc-700">
                      <Link
                        href={`/transaction/${item.id}`}
                        className="block rounded px-1 py-1 transition hover:bg-zinc-100"
                      >
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </Link>
                    </td>
                    <td className="sticky right-0 z-10 min-w-[184px] border-l border-violet-100 bg-[#f7f7fc] px-3 py-3 shadow-[-14px_0_24px_-20px_rgba(76,65,120,0.55)] has-[details[open]]:z-50">
                      <div className="flex items-center justify-end gap-2">
                        {item.payment_status === "Unpaid" ? (
                          <form action={handleApprove}>
                            <input type="hidden" name="id" value={item.id} />
                            <DeleteConfirmButton
                              className="h-8 rounded-lg bg-violet-700 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-800"
                              label="Approve"
                              confirmMessage={`Approve payment for transaction ${item.id}?`}
                            />
                          </form>
                        ) : item.delivery_status === "Pending" ? (
                          <form action={handleMarkDelivered}>
                            <input type="hidden" name="id" value={item.id} />
                            <DeleteConfirmButton
                              className="h-8 rounded-lg bg-violet-700 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-800"
                              label="Mark Delivered"
                              confirmMessage={`Mark transaction ${item.id} as delivered?`}
                            />
                          </form>
                        ) : (
                          <Link
                            href={`/transaction/${item.id}`}
                            className="inline-flex h-8 items-center rounded-lg border border-violet-100 bg-white/80 px-3 text-xs font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
                          >
                            View
                          </Link>
                        )}

                        <details
                          name="transaction-actions"
                          data-dismissible-menu
                          className="group relative z-20 open:z-50"
                        >
                          <summary
                            aria-label={`More actions for transaction ${item.id}`}
                            className="grid size-8 cursor-pointer list-none place-items-center rounded-lg border border-violet-100 bg-white/80 text-slate-500 shadow-sm transition hover:bg-violet-50 hover:text-violet-700 [&::-webkit-details-marker]:hidden"
                          >
                            <MoreHorizontal aria-hidden="true" className="size-4" />
                          </summary>
                          <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-xl border border-violet-100 bg-white p-1.5 text-left shadow-[0_18px_45px_rgba(73,61,112,0.24)]">
                            <Link
                              href={`/transaction/${item.id}`}
                              className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                            >
                              View detail
                            </Link>
                            <Link
                              href={`/transaction/${item.id}/invoice/download`}
                              className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                            >
                              Download invoice
                            </Link>
                            <div className="my-1 border-t border-slate-100" />
                            <form action={handleDelete}>
                              <input type="hidden" name="id" value={item.id} />
                              <DeleteConfirmButton
                                className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                                label="Delete transaction"
                                confirmMessage={`Delete transaction ${item.id}? This action cannot be undone.`}
                              />
                            </form>
                          </div>
                        </details>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DismissibleMenuGroup>
      </section>
    </div>
  );
}
