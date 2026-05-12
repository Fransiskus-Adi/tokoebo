"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

type ProductOption = {
  id: string;
  name: string;
  price: number;
};

type TransactionCreateFormProps = {
  products: ProductOption[];
  onSubmit: (formData: FormData) => Promise<void>;
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function TransactionCreateForm({ products, onSubmit }: TransactionCreateFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id ?? "");
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);

  const subtotal = useMemo(() => {
    const lookup = new Map(products.map((product) => [product.id, product]));
    return items.reduce((sum, item) => {
      const product = lookup.get(item.productId);
      if (!product) return sum;
      return sum + Number(product.price) * item.quantity;
    }, 0);
  }, [products, items]);

  const grandTotal = subtotal + deliveryFee;

  return (
    <form action={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-2 sm:col-span-2">
        <span className="text-sm font-medium text-zinc-700">Customer Name</span>
        <input
          name="customerName"
          required
          className="h-10 rounded-md border px-3 text-sm outline-none ring-zinc-300 focus:ring"
          placeholder="Input customer name"
        />
      </label>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <span className="text-sm font-medium text-zinc-700">Ordered Products</span>
        <div className="rounded-md border p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
            <select
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              className="h-10 rounded-md border px-3 text-sm outline-none ring-zinc-300 focus:ring"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({currency.format(product.price)})
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={quantityInput}
              onChange={(event) => setQuantityInput(Math.max(1, Number(event.target.value) || 1))}
              className="h-10 rounded-md border px-3 text-sm outline-none ring-zinc-300 focus:ring"
              placeholder="Qty"
            />
            <button
              type="button"
              className="h-10 rounded-md border bg-zinc-100 px-4 text-lg font-semibold text-zinc-800 hover:bg-zinc-200"
              aria-label="Add product"
              onClick={() => {
                if (!selectedProductId) return;
                setItems((prev) => {
                  const existing = prev.find((item) => item.productId === selectedProductId);
                  if (existing) {
                    return prev.map((item) =>
                      item.productId === selectedProductId
                        ? { ...item, quantity: item.quantity + quantityInput }
                        : item,
                    );
                  }
                  return [...prev, { productId: selectedProductId, quantity: quantityInput }];
                });
                setQuantityInput(1);
              }}
            >
              +
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {items.length === 0 ? (
              <p className="text-xs text-zinc-500">Click + to add products to this transaction.</p>
            ) : (
              items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;
                return (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between rounded-md border bg-zinc-50 px-3 py-2 text-sm"
                  >
                    <span>
                      {product.name} x{item.quantity}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {currency.format(Number(product.price) * item.quantity)}
                      </span>
                      <button
                        type="button"
                        className="text-xs text-rose-600 hover:underline"
                        onClick={() =>
                          setItems((prev) => prev.filter((entry) => entry.productId !== item.productId))
                        }
                      >
                        Remove
                      </button>
                    </div>
                    <input type="hidden" name="productIds" value={item.productId} />
                    <input type="hidden" name="quantities" value={item.quantity} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700">Delivery Fee</span>
        <input
          name="deliveryFee"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={deliveryFee}
          onChange={(event) => setDeliveryFee(Number(event.target.value) || 0)}
          className="h-10 rounded-md border px-3 text-sm outline-none ring-zinc-300 focus:ring"
          placeholder="0"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700">Status</span>
        <select
          name="status"
          defaultValue="Unpaid"
          className="h-10 rounded-md border px-3 text-sm outline-none ring-zinc-300 focus:ring"
        >
          <option value="Unpaid">Unpaid</option>
          <option value="Paid">Paid</option>
        </select>
      </label>

      <div className="rounded-md border bg-zinc-50 p-4 text-sm sm:col-span-2">
        <p className="text-zinc-600">Subtotal Product: <span className="font-medium text-zinc-900">{currency.format(subtotal)}</span></p>
        <p className="text-zinc-600">Delivery Fee: <span className="font-medium text-zinc-900">{currency.format(deliveryFee)}</span></p>
        <p className="mt-1 text-zinc-700">Total: <span className="text-base font-semibold text-zinc-900">{currency.format(grandTotal)}</span></p>
      </div>

      <div className="mt-2 flex gap-3 sm:col-span-2">
        <Button type="submit">Save Transaction</Button>
        <Link href="/transaction" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
