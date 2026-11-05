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
    <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#f5f1ff_0%,#f8f7ff_42%,#eef8fb_100%)] p-3 shadow-[0_24px_80px_rgba(73,61,112,0.12)] sm:p-5 xl:p-6">
      <div aria-hidden="true" className="absolute -right-24 top-12 -z-10 size-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-20 bottom-20 -z-10 size-64 rounded-full bg-violet-300/20 blur-3xl" />
      <header className="px-1 py-1">
        <p className="text-sm font-medium text-violet-700">Account</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Profile Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Kelola informasi akun, pembayaran, dan keamanan.</p>
      </header>

      {/* Success banners */}
      {savedSection === "payment" && (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur">
          ✓ Payment information saved successfully.
        </div>
      )}
      {savedSection === "password" && (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur">
          ✓ Password updated successfully.
        </div>
      )}

      {/* Account Info (read-only) */}
      <section className="rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Account Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-zinc-500">Username</p>
            <p className="rounded-xl border border-white/90 bg-white/60 px-3 py-2.5 text-sm text-slate-900 shadow-sm">
              {profile.username}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-zinc-500">Role</p>
            <p className="rounded-xl border border-white/90 bg-white/60 px-3 py-2.5 text-sm capitalize text-slate-900 shadow-sm">
              {profile.role}
            </p>
          </div>
        </div>
      </section>

      {/* Payment Information */}
      <section className="rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl sm:p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-950">Payment Information</h2>
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
              className="w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100/70"
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
              className="w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100/70"
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
              className="w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100/70 sm:max-w-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700"
            >
              Save Payment Info
            </button>
          </div>
        </form>
      </section>

      {/* Change Password */}
      <section className="rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_50px_rgba(76,65,120,0.10)] backdrop-blur-xl sm:p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-950">Change Password</h2>
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
              className="w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100/70"
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
              className="w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100/70"
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
              className="w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100/70"
            />
          </div>

          <div>
            <button
              type="submit"
              className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700"
            >
              Update Password
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
