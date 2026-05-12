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
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-zinc-500">Category</p>
        <h1 className="text-2xl font-semibold text-zinc-900">Category Management</h1>
      </header>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Add Category</h2>
        <form action={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            name="name"
            placeholder="Category name"
            required
            className="h-10 flex-1 rounded-md border px-3 text-sm outline-none ring-zinc-300 focus:ring"
          />
          <button type="submit" className={buttonVariants()}>
            + Add Category
          </button>
        </form>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Category List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-zinc-500">
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
                  <tr key={item.id} className="border-b last:border-0">
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
