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
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;

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
        <div className="rounded-md border p-4">
          <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-500">Product</span>
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
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-500">Quantity</span>
              <input
                type="number"
                min="1"
                value={quantityInput}
                onChange={(event) => setQuantityInput(Math.max(1, Number(event.target.value) || 1))}
                className="h-10 rounded-md border px-3 text-sm outline-none ring-zinc-300 focus:ring"
                placeholder="Qty"
              />
            </label>
            <button
              type="button"
              className="h-10 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 sm:mt-[20px]"
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
              Add Product
            </button>
          </div>

          {selectedProduct ? (
            <p className="mt-2 text-xs text-zinc-500">
              Unit price: <span className="font-medium text-zinc-700">{currency.format(selectedProduct.price)}</span>
            </p>
          ) : null}

          <div className="mt-4 space-y-2">
            {items.length === 0 ? (
              <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-3 text-xs text-zinc-500">
                No products added yet. Pick a product, set quantity, then click Add Product.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="space-y-2 sm:hidden">
                  {items.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={item.productId} className="rounded-md border bg-zinc-50 p-3 text-sm">
                        <p className="font-medium text-zinc-900">{product.name}</p>
                        <p className="mt-1 text-xs text-zinc-600">Unit price: {currency.format(product.price)}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              className="h-7 w-7 rounded border bg-white text-sm hover:bg-zinc-100"
                              onClick={() =>
                                setItems((prev) =>
                                  prev.map((entry) =>
                                    entry.productId === item.productId
                                      ? { ...entry, quantity: Math.max(1, entry.quantity - 1) }
                                      : entry,
                                  ),
                                )
                              }
                            >
                              -
                            </button>
                            <span className="min-w-5 text-center font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              className="h-7 w-7 rounded border bg-white text-sm hover:bg-zinc-100"
                              onClick={() =>
                                setItems((prev) =>
                                  prev.map((entry) =>
                                    entry.productId === item.productId
                                      ? { ...entry, quantity: entry.quantity + 1 }
                                      : entry,
                                  ),
                                )
                              }
                            >
                              +
                            </button>
                          </div>
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
                        <p className="mt-2 text-sm font-semibold text-zinc-800">
                          Subtotal: {currency.format(Number(product.price) * item.quantity)}
                        </p>
                        <input type="hidden" name="productIds" value={item.productId} />
                        <input type="hidden" name="quantities" value={item.quantity} />
                      </div>
                    );
                  })}
                </div>

                <div className="hidden overflow-x-auto rounded-md border sm:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-zinc-600">
                      <tr>
                        <th className="px-3 py-2 font-medium">Product</th>
                        <th className="px-3 py-2 font-medium">Unit Price</th>
                        <th className="px-3 py-2 font-medium">Quantity</th>
                        <th className="px-3 py-2 font-medium">Subtotal</th>
                        <th className="px-3 py-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const product = products.find((p) => p.id === item.productId);
                        if (!product) return null;
                        return (
                          <tr key={item.productId} className="border-t">
                            <td className="px-3 py-2">{product.name}</td>
                            <td className="px-3 py-2">{currency.format(product.price)}</td>
                            <td className="px-3 py-2">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  className="h-7 w-7 rounded border bg-white text-sm hover:bg-zinc-100"
                                  onClick={() =>
                                    setItems((prev) =>
                                      prev.map((entry) =>
                                        entry.productId === item.productId
                                          ? { ...entry, quantity: Math.max(1, entry.quantity - 1) }
                                          : entry,
                                      ),
                                    )
                                  }
                                >
                                  -
                                </button>
                                <span className="min-w-6 text-center font-medium">{item.quantity}</span>
                                <button
                                  type="button"
                                  className="h-7 w-7 rounded border bg-white text-sm hover:bg-zinc-100"
                                  onClick={() =>
                                    setItems((prev) =>
                                      prev.map((entry) =>
                                        entry.productId === item.productId
                                          ? { ...entry, quantity: entry.quantity + 1 }
                                          : entry,
                                      ),
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2 font-medium">
                              {currency.format(Number(product.price) * item.quantity)}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                className="text-xs text-rose-600 hover:underline"
                                onClick={() =>
                                  setItems((prev) => prev.filter((entry) => entry.productId !== item.productId))
                                }
                              >
                                Remove
                              </button>
                            </td>
                            <input type="hidden" name="productIds" value={item.productId} />
                            <input type="hidden" name="quantities" value={item.quantity} />
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
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
