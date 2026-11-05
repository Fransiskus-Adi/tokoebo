import { revalidatePath } from "next/cache";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { buttonVariants } from "@/components/ui/button";
import { createCategory, deleteCategoryById, listCategories } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CategoryPage() {
  async function handleCreate(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    await createCategory({ name });
    revalidatePath("/category");
  }

  async function handleDelete(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await deleteCategoryById(id);
    revalidatePath("/category");
  }

  const categories = await listCategories();

  return (
    <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#f5f1ff_0%,#f8f7ff_42%,#eef8fb_100%)] p-3 shadow-[0_24px_80px_rgba(73,61,112,0.12)] sm:p-5 lg:h-[calc(100dvh-5.5rem)] xl:p-6">
      <div aria-hidden="true" className="absolute -right-24 top-12 -z-10 size-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-20 bottom-20 -z-10 size-64 rounded-full bg-violet-300/20 blur-3xl" />
      <header className="px-1 py-1">
        <p className="text-sm font-medium text-violet-700">Category</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Category Management</h1>
        <p className="mt-1 text-sm text-slate-600">Susun kategori agar katalog produk mudah dikelola.</p>
      </header>

      <section className="rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Add Category</h2>
        <form action={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            name="name"
            placeholder="Category name"
            required
            className="h-11 flex-1 rounded-xl border border-white/90 bg-white/70 px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100/70"
          />
          <button type="submit" className="h-11 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
            + Add Category
          </button>
        </form>
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl sm:p-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-950">Category List</h2>
          <span className="rounded-full bg-violet-100/80 px-3 py-1 text-xs font-semibold text-violet-700">{categories.length} kategori</span>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#f8fbfd]">
              <tr className="border-b border-violet-100 text-slate-500">
                <th className="px-2 py-2 font-medium">ID</th>
                <th className="px-2 py-2 font-medium">Name</th>
                <th className="px-2 py-2 font-medium">Created</th>
                <th className="px-2 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-6 text-center text-zinc-500">
                    No categories yet.
                  </td>
                </tr>
              ) : (
                categories.map((item) => (
                  <tr key={item.id} className="border-b border-white/80 transition hover:bg-white/35 last:border-0">
                    <td className="px-2 py-3 font-medium text-zinc-900">{item.id}</td>
                    <td className="px-2 py-3 text-zinc-700">{item.name}</td>
                    <td className="px-2 py-3 text-zinc-700">{new Date(item.created_at).toLocaleDateString("id-ID")}</td>
                    <td className="px-2 py-3">
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={item.id} />
                        <DeleteConfirmButton
                          className={buttonVariants({ variant: "destructive", size: "sm" })}
                          confirmMessage={`Delete category ${item.name}?`}
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
