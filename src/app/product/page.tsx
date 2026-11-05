import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { buttonVariants } from "@/components/ui/button";
import { deleteProductById, listProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function ProductPage() {
  async function handleDelete(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await deleteProductById(id);
    revalidatePath("/product");
  }

  const products = await listProducts();

  return (
    <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#f5f1ff_0%,#f8f7ff_42%,#eef8fb_100%)] p-3 shadow-[0_24px_80px_rgba(73,61,112,0.12)] sm:p-5 lg:h-[calc(100dvh-5.5rem)] xl:p-6">
      <div aria-hidden="true" className="absolute -right-24 top-12 -z-10 size-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-20 bottom-20 -z-10 size-64 rounded-full bg-violet-300/20 blur-3xl" />
      <header className="px-1 py-1">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-violet-700">Product</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Product Management</h1>
            <p className="mt-1 text-sm text-slate-600">Kelola katalog, harga, dan persediaan produk.</p>
          </div>
          <Link href="/product/new" className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
            + Add Product
          </Link>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl sm:p-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Katalog aktif</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Product List</h2>
          </div>
          <span className="rounded-full bg-violet-100/80 px-3 py-1 text-xs font-semibold text-violet-700">{products.length} produk</span>
        </div>
        <div className="-mx-4 min-h-0 flex-1 overflow-auto px-4 touch-pan-x sm:-mx-6 sm:px-6">
          <table className="w-full min-w-[760px] text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-[#f8fbfd]">
              <tr className="border-b border-violet-100 text-slate-500">
                <th className="px-2 py-2 font-medium">Image</th>
                <th className="px-2 py-2 font-medium">Product Name</th>
                <th className="px-2 py-2 font-medium">Category</th>
                <th className="px-2 py-2 font-medium">Price</th>
                <th className="px-2 py-2 font-medium">Stock</th>
                <th className="px-2 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-center text-zinc-500">
                    No products yet. Click Add Product to create one.
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} className="border-b border-white/80 transition hover:bg-white/35 last:border-0">
                    <td className="px-2 py-3">
                      <Link
                        href={`/product/${item.id}`}
                        className="block rounded px-1 py-1 transition hover:bg-zinc-100"
                      >
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="size-12 rounded-xl border border-white/80 object-cover shadow-sm"
                          />
                        ) : (
                          <div className="inline-flex size-12 items-center justify-center rounded-xl border border-white/80 bg-white/60 text-[11px] text-slate-500">
                            No image
                          </div>
                        )}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-zinc-700">
                      <Link
                        href={`/product/${item.id}`}
                        className="block rounded px-1 py-1 transition hover:bg-zinc-100"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-zinc-700">
                      <Link
                        href={`/product/${item.id}`}
                        className="block rounded px-1 py-1 transition hover:bg-zinc-100"
                      >
                        {item.category}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-zinc-700">
                      <Link
                        href={`/product/${item.id}`}
                        className="block rounded px-1 py-1 transition hover:bg-zinc-100"
                      >
                        {currency.format(item.price)}
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      <Link
                        href={`/product/${item.id}`}
                        className="block rounded px-1 py-1 transition hover:bg-zinc-100"
                      >
                        <span
                          className={
                            item.stock > 0
                              ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                              : "rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700"
                          }
                        >
                          {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={item.id} />
                        <DeleteConfirmButton
                          className={buttonVariants({ variant: "destructive", size: "sm" })}
                          confirmMessage={`Delete product ${item.name}? This action cannot be undone.`}
                        />
                      </form>
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
