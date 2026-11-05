import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductEditForm } from "@/components/product-edit-form";
import { createProduct, listCategories } from "@/lib/store";

export const dynamic = "force-dynamic";

async function createProductAction(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));

  if (!name || !category || Number.isNaN(price) || Number.isNaN(stock) || price < 0 || stock < 0) {
    throw new Error("Invalid product data.");
  }

  await createProduct({ name, category, price, stock, imageUrl: "" });
  redirect("/product");
}

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#f5f1ff_0%,#f8f7ff_42%,#eef8fb_100%)] p-3 shadow-[0_24px_80px_rgba(73,61,112,0.12)] sm:p-5 xl:p-6">
      <div aria-hidden="true" className="absolute -right-24 top-12 -z-10 size-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-20 bottom-20 -z-10 size-64 rounded-full bg-violet-300/20 blur-3xl" />
      <header className="px-1 py-1">
        <p className="text-sm font-medium text-violet-700">Product</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Add Product</h1>
        <p className="mt-1 text-sm text-slate-600">Tambahkan produk baru ke katalog Eboo Bakery.</p>
      </header>

      <section className="rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <ProductEditForm
            product={{
              name: "",
              category: categories[0]?.name ?? "",
              price: 0,
              stock: 0,
              image_url: "",
            }}
            categories={categories.map((item) => item.name)}
            onSave={createProductAction}
            priceLabel="-"
            submitLabel="Save Product"
            confirmMessage="Create this product?"
          />
          <div className="sm:col-span-2">
            <Link href="/product" className="inline-flex h-10 items-center rounded-xl border border-white/90 bg-white/65 px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-white hover:text-violet-700">
              Cancel
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
