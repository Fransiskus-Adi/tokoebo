import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
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
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-zinc-500">Product</p>
        <h1 className="text-2xl font-semibold text-zinc-900">Add Product</h1>
      </header>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
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
            <Link href="/product" className={buttonVariants({ variant: "outline" })}>
              Cancel
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
