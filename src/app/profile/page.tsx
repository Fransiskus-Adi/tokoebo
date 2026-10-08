import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, decodeTokenPayload } from "@/lib/auth";
import { getProfile, savePaymentInfo, changePassword } from "@/modules/profile/controller";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  searchParams: Promise<{ saved?: string }>;
};

async function getCurrentUsername(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = decodeTokenPayload(token);
  return typeof payload?.sub === "string" ? payload.sub : null;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const username = await getCurrentUsername();
  if (!username) redirect("/login");

  const profile = await getProfile(username);
  if (!profile) redirect("/login");

  const query = await searchParams;
  const savedSection = query.saved; // "payment" | "password" | undefined


  async function updatePaymentAction(formData: FormData) {
    "use server";

    const u = await getCurrentUsername();
    if (!u) throw new Error("Unauthorized");

    const paymentName = String(formData.get("payment_name") ?? "").trim();
    const paymentBank = String(formData.get("payment_bank") ?? "").trim();
    const paymentAccountNo = String(formData.get("payment_account_no") ?? "").trim();

    await savePaymentInfo(u, paymentName, paymentBank, paymentAccountNo);
    redirect("/profile?saved=payment");
  }

  async function updatePasswordAction(formData: FormData) {
    "use server";

    const u = await getCurrentUsername();
    if (!u) throw new Error("Unauthorized");

    const currentPassword = String(formData.get("current_password") ?? "");
    const newPassword = String(formData.get("new_password") ?? "");
    const confirmPassword = String(formData.get("confirm_password") ?? "");

    if (newPassword !== confirmPassword) {
      throw new Error("New password and confirmation do not match.");
    }

    await changePassword(u, currentPassword, newPassword);
    redirect("/profile?saved=password");
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-zinc-500">Account</p>
        <h1 className="text-2xl font-semibold text-zinc-900">Profile Settings</h1>
      </header>

      {/* Success banners */}
      {savedSection === "payment" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✓ Payment information saved successfully.
        </div>
      )}
      {savedSection === "password" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✓ Password updated successfully.
        </div>
      )}

      {/* Account Info (read-only) */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Account Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-zinc-500">Username</p>
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900">
              {profile.username}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-zinc-500">Role</p>
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 capitalize">
              {profile.role}
            </p>
          </div>
        </div>
      </section>

      {/* Payment Information */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-zinc-900">Payment Information</h2>
        <p className="mb-4 text-sm text-zinc-500">
          This information will be shown on invoices sent to customers.
        </p>

        <form action={updatePaymentAction} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="payment_name" className="mb-1 block text-xs font-medium text-zinc-700">
              Account Holder Name
            </label>
            <input
              id="payment_name"
              name="payment_name"
              type="text"
              required
              defaultValue={profile.payment_name ?? ""}
              placeholder="e.g. Brigitta Agrari"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="payment_bank" className="mb-1 block text-xs font-medium text-zinc-700">
              Bank Name
            </label>
            <input
              id="payment_bank"
              name="payment_bank"
              type="text"
              required
              defaultValue={profile.payment_bank ?? ""}
              placeholder="e.g. BCA"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="payment_account_no"
              className="mb-1 block text-xs font-medium text-zinc-700"
            >
              Account Number
            </label>
            <input
              id="payment_account_no"
              name="payment_account_no"
              type="text"
              required
              defaultValue={profile.payment_account_no ?? ""}
              placeholder="e.g. 7180329891"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Save Payment Info
            </button>
          </div>
        </form>
      </section>

      {/* Change Password */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-zinc-900">Change Password</h2>
        <p className="mb-4 text-sm text-zinc-500">
          For security, enter your current password before setting a new one.
        </p>

        <form action={updatePasswordAction} className="grid max-w-sm gap-4">
          <div>
            <label
              htmlFor="current_password"
              className="mb-1 block text-xs font-medium text-zinc-700"
            >
              Current Password
            </label>
            <input
              id="current_password"
              name="current_password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="new_password"
              className="mb-1 block text-xs font-medium text-zinc-700"
            >
              New Password
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="mb-1 block text-xs font-medium text-zinc-700"
            >
              Confirm New Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Update Password
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
