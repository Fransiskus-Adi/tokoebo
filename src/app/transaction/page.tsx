import Link from "next/link";
import { revalidatePath } from "next/cache";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { buttonVariants } from "@/components/ui/button";
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
    <div className="min-w-0 flex flex-col gap-6">
      <header className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500">Transaction</p>
            <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Transaction Management</h1>
          </div>
          <Link href="/transaction/new" className={buttonVariants({ size: "sm" })}>
            + Add Transaction
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <div className="aspect-square rounded-xl border bg-white p-4 shadow-sm sm:aspect-auto sm:min-h-28">
          <div className="flex h-full flex-col justify-between">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Unpaid</p>
            <p className="mt-2 text-2xl font-semibold text-amber-700">{unpaidTransactions}</p>
          </div>
        </div>
        <div className="aspect-square rounded-xl border bg-white p-4 shadow-sm sm:aspect-auto sm:min-h-28">
          <div className="flex h-full flex-col justify-between">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Paid</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{paidTransactions}</p>
          </div>
        </div>
        <div className="aspect-square rounded-xl border bg-white p-4 shadow-sm sm:aspect-auto sm:min-h-28">
          <div className="flex h-full flex-col justify-between">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Pending Delivery</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-700">{pendingDeliveries}</p>
          </div>
        </div>
        <div className="aspect-square rounded-xl border bg-white p-4 shadow-sm sm:aspect-auto sm:min-h-28">
          <div className="flex h-full flex-col justify-between">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Delivered</p>
            <p className="mt-2 text-2xl font-semibold text-sky-700">{deliveredTransactions}</p>
          </div>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Transaction List</h2>
        <div className="w-full max-w-full overflow-x-auto touch-pan-x">
          <table className="min-w-[920px] text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b text-zinc-500">
                <th className="px-2 py-2 font-medium">ID</th>
                <th className="px-2 py-2 font-medium">Customer</th>
                <th className="px-2 py-2 font-medium">Item Bought</th>
                <th className="px-2 py-2 font-medium">Amount</th>
                <th className="px-2 py-2 font-medium">Payment Status</th>
                <th className="px-2 py-2 font-medium">Delivery Status</th>
                <th className="px-2 py-2 font-medium">Date</th>
                <th className="px-2 py-2 font-medium">Action</th>
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
                  <tr key={item.id} className="border-b last:border-0">
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
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        {item.payment_status === "Unpaid" ? (
                          <form action={handleApprove}>
                            <input type="hidden" name="id" value={item.id} />
                            <DeleteConfirmButton
                              className={buttonVariants({ size: "sm" })}
                              label="Approve"
                              confirmMessage={`Approve payment for transaction ${item.id}?`}
                            />
                          </form>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className={buttonVariants({ size: "sm", variant: "secondary" })}
                          >
                            Approved
                          </button>
                        )}

                        {item.delivery_status === "Delivered" ? (
                          <button
                            type="button"
                            disabled
                            className={buttonVariants({ size: "sm", variant: "secondary" })}
                          >
                            Delivered
                          </button>
                        ) : item.payment_status === "Paid" ? (
                          <form action={handleMarkDelivered}>
                            <input type="hidden" name="id" value={item.id} />
                            <DeleteConfirmButton
                              className={buttonVariants({ size: "sm" })}
                              label="Mark Delivered"
                              confirmMessage={`Mark transaction ${item.id} as delivered?`}
                            />
                          </form>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className={buttonVariants({ size: "sm", variant: "secondary" })}
                            title="Payment must be approved first"
                          >
                            Awaiting Payment
                          </button>
                        )}

                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={item.id} />
                          <DeleteConfirmButton
                            className={buttonVariants({ variant: "destructive", size: "sm" })}
                            confirmMessage={`Delete transaction ${item.id}? This action cannot be undone.`}
                          />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
