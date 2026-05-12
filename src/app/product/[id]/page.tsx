import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
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
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-zinc-500">Product Detail</p>
        <h1 className="text-2xl font-semibold text-zinc-900">{product.name}</h1>
      </header>

      <section className="grid gap-4 rounded-2xl border bg-white p-6 shadow-sm sm:grid-cols-2">
        <ProductEditForm
          product={product}
          categories={categories.map((item) => item.name)}
          onSave={saveProductChanges}
          priceLabel={currency.format(product.price)}
        />
      </section>

      <div>
        <Link href="/product" className={buttonVariants({ variant: "outline" })}>
          Back to Product List
        </Link>
      </div>
    </div>
  );
}
