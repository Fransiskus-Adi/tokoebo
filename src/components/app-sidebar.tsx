"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const generalMenus = [
  { label: "Dashboard", href: "/" },
  { label: "Transaction", href: "/transaction" },
];

const toolMenus = [
  { label: "Product", href: "/product" },
  { label: "Category", href: "/category" },
];

const mobileMenus = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Transaction", href: "/transaction", icon: "receipt" },
  { label: "Product", href: "/product", icon: "box" },
  { label: "Category", href: "/category", icon: "tag" },
] as const;

function Icon({ type, active }: { type: (typeof mobileMenus)[number]["icon"]; active: boolean }) {
  const color = active ? "text-sky-600" : "text-zinc-700";

  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${color}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 11.5 12 5l8 6.5" />
        <path d="M7 10.5V19h10v-8.5" />
      </svg>
    );
  }

  if (type === "receipt") {
    return (
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${color}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 4h12v16l-3-2-3 2-3-2-3 2V4Z" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
      </svg>
    );
  }

  if (type === "box") {
    return (
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${color}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" />
        <path d="M3 7.5 12 12l9-4.5" />
        <path d="M12 12v9" />
      </svg>
    );
  }

  if (type === "tag") {
    return (
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${color}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 3H5v6l8.5 8.5a2.1 2.1 0 0 0 3 0l1-1a2.1 2.1 0 0 0 0-3L11 3Z" />
        <circle cx="7.5" cy="7.5" r="1" />
      </svg>
    );
  }
  return null;
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 lg:hidden">
        <div className="flex w-full max-w-sm items-end justify-between rounded-2xl border border-zinc-200 bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
          {mobileMenus.slice(0, 2).map((menu) => {
            const isActive = pathname === menu.href || pathname.startsWith(`${menu.href}/`);
            return (
              <Link
                key={menu.label}
                href={menu.href}
                className="inline-flex w-[62px] flex-col items-center gap-1 py-1"
              >
                <Icon type={menu.icon} active={isActive} />
                <span className={`text-[10px] leading-none ${isActive ? "font-semibold text-sky-600" : "text-zinc-600"}`}>
                  {menu.label}
                </span>
              </Link>
            );
          })}

          <Link
            href="/transaction/new"
            aria-label="Add Transaction"
            className="-mt-7 inline-flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-md ring-4 ring-white transition hover:bg-sky-600"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </Link>

          {mobileMenus.slice(2).map((menu) => {
            const isActive = pathname === menu.href || pathname.startsWith(`${menu.href}/`);
            return (
              <Link
                key={menu.label}
                href={menu.href}
                className="inline-flex w-[62px] flex-col items-center gap-1 py-1"
              >
                <Icon type={menu.icon} active={isActive} />
                <span className={`text-[10px] leading-none ${isActive ? "font-semibold text-sky-600" : "text-zinc-600"}`}>
                  {menu.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <aside className="hidden lg:static lg:z-auto lg:block lg:w-auto lg:rounded-2xl lg:border lg:border-zinc-200 lg:bg-white lg:shadow-sm">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-5">
            <p className="text-lg font-semibold text-indigo-700">Toko Ebo</p>
          </div>

          <div className="flex-1 space-y-6 px-3 py-4">
            <section>
              <p className="px-3 pb-2 text-[11px] font-semibold tracking-wide text-zinc-400">GENERAL</p>
              <nav className="space-y-1">
                {generalMenus.map((menu) => {
                  const isActive = pathname === menu.href;
                  return (
                    <Link
                      key={menu.href}
                      href={menu.href}
                      className={
                        isActive
                          ? "block rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900"
                          : "block rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                      }
                    >
                      {menu.label}
                    </Link>
                  );
                })}
              </nav>
            </section>

            <section>
              <p className="px-3 pb-2 text-[11px] font-semibold tracking-wide text-zinc-400">TOOLS</p>
              <nav className="space-y-1">
                {toolMenus.map((menu) => {
                  const isActive = pathname === menu.href;
                  return (
                    <Link
                      key={menu.href}
                      href={menu.href}
                      className={
                        isActive
                          ? "block rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900"
                          : "block rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                      }
                    >
                      {menu.label}
                    </Link>
                  );
                })}
              </nav>
            </section>
          </div>

          <div className="border-t border-zinc-200 p-3">
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-xs text-zinc-500">Team</p>
              <p className="text-sm font-semibold text-zinc-900">Marketing</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
