import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductEditForm } from "@/components/product-edit-form";
import { getProductById, listCategories, updateProductById } from "@/lib/store";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

async function saveProductChanges(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));

  if (!id || !name || !category || Number.isNaN(price) || Number.isNaN(stock) || price < 0 || stock < 0) {
    throw new Error("Invalid product data.");
  }

  const updated = await updateProductById(id, { name, category, price, stock });
  if (!updated) notFound();

  redirect(`/product/${id}`);
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), listCategories()]);

  if (!product) notFound();

  return (
    <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#f5f1ff_0%,#f8f7ff_42%,#eef8fb_100%)] p-3 shadow-[0_24px_80px_rgba(73,61,112,0.12)] sm:p-5 xl:p-6">
      <div aria-hidden="true" className="absolute -right-24 top-12 -z-10 size-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-20 bottom-20 -z-10 size-64 rounded-full bg-violet-300/20 blur-3xl" />
      <header className="px-1 py-1">
        <p className="text-sm font-medium text-violet-700">Product Detail</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{product.name}</h1>
        <p className="mt-1 text-sm text-slate-600">Perbarui kategori, harga, dan stok produk.</p>
      </header>

      <section className="grid gap-4 rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl sm:grid-cols-2 sm:p-6">
        <ProductEditForm
          product={product}
          categories={categories.map((item) => item.name)}
          onSave={saveProductChanges}
          priceLabel={currency.format(product.price)}
        />
      </section>

      <div>
        <Link href="/product" className="inline-flex h-11 items-center rounded-xl border border-white/90 bg-white/65 px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-white hover:text-violet-700">
          Back to Product List
        </Link>
      </div>
    </div>
  );
}
