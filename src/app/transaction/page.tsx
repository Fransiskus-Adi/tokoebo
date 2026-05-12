import Link from "next/link";
import { revalidatePath } from "next/cache";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { buttonVariants } from "@/components/ui/button";
import { deleteTransactionById, listTransactions, updateTransactionStatusById } from "@/lib/store";

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

  const transactions = await listTransactions();

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
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium">Date</th>
                <th className="px-2 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center text-zinc-500">
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
                            item.status === "Paid"
                              ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                              : "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
                          }
                        >
                          {item.status}
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
                        {item.status === "Unpaid" ? (
                          <form action={handleApprove}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className={buttonVariants({ size: "sm" })}
                            >
                              Approve
                            </button>
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
