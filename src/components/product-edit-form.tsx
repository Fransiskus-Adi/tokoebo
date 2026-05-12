"use client";

import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";

type ProductEditFormProps = {
  product: {
    id?: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    image_url: string;
  };
  onSave: (formData: FormData) => Promise<void>;
  priceLabel: string;
  submitLabel?: string;
  confirmMessage?: string;
  categories?: string[];
};

export function ProductEditForm({
  product,
  onSave,
  priceLabel,
  submitLabel = "Save Changes",
  confirmMessage = "Save changes to this product?",
  categories,
}: ProductEditFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form action={onSave} onSubmit={handleSubmit} className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
      {product.id ? <input type="hidden" name="id" value={product.id} /> : null}

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Name</span>
        <input
          name="name"
          defaultValue={product.name}
          required
          className="h-10 rounded-md border px-3 text-sm outline-none ring-zinc-300 focus:ring"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Category</span>
        {categories && categories.length > 0 ? (
          <select
            name="category"
            defaultValue={product.category || categories[0]}
            required
            className="h-10 rounded-md border px-3 text-sm outline-none ring-zinc-300 focus:ring"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="category"
            defaultValue={product.category}
            required
            className="h-10 rounded-md border px-3 text-sm outline-none ring-zinc-300 focus:ring"
          />
        )}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Price</span>
        <input
          name="price"
          type="text"
          defaultValue={product.price}
          required
          className="h-10 rounded-md border px-3 text-sm outline-none ring-zinc-300 focus:ring"
        />
        <span className="text-xs text-zinc-500">Current: {priceLabel}</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Stock</span>
        <input
          name="stock"
          type="text"
          defaultValue={product.stock}
          required
          className="h-10 rounded-md border px-3 text-sm outline-none ring-zinc-300 focus:ring"
        />
      </label>

      <div className="sm:col-span-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
