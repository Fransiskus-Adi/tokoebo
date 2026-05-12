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
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500">Product</p>
            <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Product Management</h1>
          </div>
          <Link href="/product/new" className={buttonVariants({ size: "sm" })}>
            + Add Product
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Product List</h2>
        <div className="-mx-6 overflow-x-auto px-6 touch-pan-x">
          <table className="min-w-[760px] text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b text-zinc-500">
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
                  <tr key={item.id} className="border-b last:border-0">
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
                            className="size-12 rounded-md border object-cover"
                          />
                        ) : (
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-md border bg-zinc-100 text-[11px] text-zinc-500">
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
