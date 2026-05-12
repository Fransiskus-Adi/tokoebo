import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ProductEditForm } from "@/components/product-edit-form";
import { createProduct, listCategories } from "@/lib/store";
import { validateImageMax5MB } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function createProductAction(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const image = formData.get("image");

  if (!name || !category || Number.isNaN(price) || Number.isNaN(stock) || price < 0 || stock < 0) {
    throw new Error("Invalid product data.");
  }

  if (!(image instanceof File) || image.size === 0) {
    throw new Error("Product image is required.");
  }

  validateImageMax5MB(image);

  const ext = path.extname(image.name).toLowerCase() || ".jpg";
  const fileName = `product-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
  const relativePath = `/uploads/products/${fileName}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  const fullPath = path.join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });
  const bytes = await image.arrayBuffer();
  await writeFile(fullPath, Buffer.from(bytes));

  await createProduct({ name, category, price, stock, imageUrl: relativePath });
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
            requireImage
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
