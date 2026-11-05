"use client";

import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-11 rounded-xl border border-white/90 bg-white/70 px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100/70";

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
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</span>
        <input
          name="name"
          defaultValue={product.name}
          required
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</span>
        {categories && categories.length > 0 ? (
          <select
            name="category"
            defaultValue={product.category || categories[0]}
            required
            className={fieldClass}
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
            className={fieldClass}
          />
        )}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</span>
        <input
          name="price"
          type="text"
          defaultValue={product.price}
          required
          className={fieldClass}
        />
        <span className="text-xs text-zinc-500">Current: {priceLabel}</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stock</span>
        <input
          name="stock"
          type="text"
          defaultValue={product.stock}
          required
          className={fieldClass}
        />
      </label>

      <div className="sm:col-span-2">
        <Button type="submit" className="h-11 rounded-xl bg-violet-700 px-5 font-semibold shadow-lg shadow-violet-700/20 hover:bg-violet-800">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
