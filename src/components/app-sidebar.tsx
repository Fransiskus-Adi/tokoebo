"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import {
  ChevronRight,
  Ellipsis,
  Home,
  LogOut,
  Package,
  Plus,
  ReceiptText,
  Tags,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const dashboardMenu = { label: "Dashboard", href: "/", icon: Home };
const transactionMenu = { label: "Transaction", href: "/transaction", icon: ReceiptText };
const productMenu = { label: "Product", href: "/product", icon: Package };
const categoryMenu = { label: "Category", href: "/category", icon: Tags };
const profileMenu = { label: "Profile", href: "/profile", icon: UserRound };

const menuSections: { label: string; items: MenuItem[] }[] = [
  {
    label: "GENERAL",
    items: [dashboardMenu, transactionMenu],
  },
  {
    label: "TOOLS",
    items: [productMenu, categoryMenu],
  },
  {
    label: "ACCOUNT",
    items: [profileMenu],
  },
];

const mobileLeftMenus = [dashboardMenu, transactionMenu];
const mobileMoreMenus = [categoryMenu, profileMenu];

function isMenuActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ currentUser }: { currentUser: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isMoreActive = mobileMoreMenus.some((menu) => isMenuActive(pathname, menu.href));

  async function handleLogout() {
    setIsMoreOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 lg:hidden print:hidden">
        <div className="flex w-full max-w-md items-end justify-between rounded-[1.4rem] border border-white/80 bg-white/80 px-3 py-2 shadow-[0_18px_50px_rgba(76,65,120,0.20)] backdrop-blur-xl">
          {mobileLeftMenus.map((menu) => {
            const active = isMenuActive(pathname, menu.href);
            const Icon = menu.icon;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition ${
                  active ? "bg-violet-100/80 text-violet-700" : "text-slate-500 hover:bg-white/80 hover:text-violet-700"
                }`}
              >
                <Icon aria-hidden="true" className="size-4" strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-semibold leading-none">{menu.label}</span>
              </Link>
            );
          })}

          <Link
            href="/transaction/new"
            aria-label="Tambah transaksi"
            className="-mt-7 grid size-14 place-items-center rounded-2xl bg-violet-700 text-white shadow-lg shadow-violet-700/30 ring-4 ring-white/90 transition hover:-translate-y-0.5 hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700"
          >
            <Plus aria-hidden="true" className="size-6" strokeWidth={2.2} />
          </Link>

          <Link
            href={productMenu.href}
            aria-current={isMenuActive(pathname, productMenu.href) ? "page" : undefined}
            className={`inline-flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition ${
              isMenuActive(pathname, productMenu.href)
                ? "bg-violet-100/80 text-violet-700"
                : "text-slate-500 hover:bg-white/80 hover:text-violet-700"
            }`}
          >
            <Package aria-hidden="true" className="size-4" strokeWidth={isMenuActive(pathname, productMenu.href) ? 2.2 : 1.8} />
            <span className="text-[10px] font-semibold leading-none">{productMenu.label}</span>
          </Link>

          <Dialog.Root open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <Dialog.Trigger
              aria-current={isMoreActive ? "page" : undefined}
              className={`inline-flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition ${
                isMoreActive || isMoreOpen
                  ? "bg-violet-100/80 text-violet-700"
                  : "text-slate-500 hover:bg-white/80 hover:text-violet-700"
              }`}
            >
              <Ellipsis aria-hidden="true" className="size-4" strokeWidth={isMoreActive || isMoreOpen ? 2.2 : 1.8} />
              <span className="text-[10px] font-semibold leading-none">More</span>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-[60] bg-slate-950/30 backdrop-blur-[2px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
              <Dialog.Popup className="fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-md rounded-t-[2rem] border border-b-0 border-white/80 bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-18px_60px_rgba(30,41,59,0.18)] transition-transform duration-200 data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full">
                <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
                <div className="flex items-center justify-between gap-4">
                  <Dialog.Title className="text-lg font-semibold text-slate-950">Menu lainnya</Dialog.Title>
                  <Dialog.Close
                    aria-label="Tutup menu lainnya"
                    className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700"
                  >
                    <X aria-hidden="true" className="size-5" />
                  </Dialog.Close>
                </div>

                <nav aria-label="Menu lainnya" className="mt-4 space-y-2">
                  {mobileMoreMenus.map((menu) => {
                    const active = isMenuActive(pathname, menu.href);
                    const Icon = menu.icon;

                    return (
                      <Link
                        key={menu.href}
                        href={menu.href}
                        onNavigate={() => setIsMoreOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-14 items-center gap-3 rounded-2xl px-4 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 ${
                          active ? "bg-violet-100/80 text-violet-800" : "bg-slate-50 text-slate-700 hover:bg-violet-50 hover:text-violet-800"
                        }`}
                      >
                        <span className={`grid size-9 place-items-center rounded-xl ${active ? "bg-white text-violet-700" : "bg-white text-slate-500"}`}>
                          <Icon aria-hidden="true" className="size-4" strokeWidth={active ? 2.2 : 1.8} />
                        </span>
                        <span className="font-semibold">{menu.label}</span>
                        <ChevronRight aria-hidden="true" className="ml-auto size-4 opacity-50" />
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-red-50 px-4 font-semibold text-red-700 transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    <span className="grid size-9 place-items-center rounded-xl bg-white text-red-600">
                      <LogOut aria-hidden="true" className="size-4" />
                    </span>
                    Logout
                  </button>
                </div>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </nav>

      <aside className="relative hidden min-h-[calc(100dvh-3rem)] overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(165deg,rgba(255,255,255,0.94)_0%,rgba(248,246,255,0.88)_55%,rgba(238,249,251,0.88)_100%)] shadow-[0_24px_70px_rgba(73,61,112,0.10)] lg:sticky lg:top-6 lg:block lg:self-start">
        <div aria-hidden="true" className="absolute -right-20 top-1/3 size-48 rounded-full bg-violet-300/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-16 -left-14 size-44 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative flex min-h-[calc(100dvh-3rem)] flex-col">
          <div className="border-b border-violet-100/80 px-6 py-6">
            <Link href="/" className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700">
              <Image
                src="/logo.png"
                alt="Eboo Bakery"
                width={150}
                height={75}
                className="h-10 w-auto object-contain"
                preload
              />
            </Link>
          </div>

          <div className="flex-1 space-y-7 px-4 py-6">
            {menuSections.map((section) => (
              <section key={section.label}>
                <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.16em] text-slate-400">{section.label}</p>
                <nav aria-label={section.label} className="space-y-1">
                  {section.items.map((menu) => {
                    const active = isMenuActive(pathname, menu.href);
                    const Icon = menu.icon;

                    return (
                      <Link
                        key={menu.href}
                        href={menu.href}
                        aria-current={active ? "page" : undefined}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                          active
                            ? "bg-violet-100/75 font-semibold text-violet-800 shadow-[inset_0_0_0_1px_rgba(196,181,253,0.35)]"
                            : "font-medium text-slate-600 hover:bg-white/75 hover:text-violet-800"
                        }`}
                      >
                        <span className={`grid size-8 place-items-center rounded-lg transition ${active ? "bg-white/80 text-violet-700 shadow-sm" : "text-slate-400 group-hover:bg-white/80 group-hover:text-violet-700"}`}>
                          <Icon aria-hidden="true" className="size-4" strokeWidth={active ? 2.2 : 1.8} />
                        </span>
                        {menu.label}
                        {active && <span aria-hidden="true" className="ml-auto size-1.5 rounded-full bg-violet-500" />}
                      </Link>
                    );
                  })}
                </nav>
              </section>
            ))}
          </div>

          <div className="p-4 pt-2">
            <div className="rounded-2xl border border-white/80 bg-white/55 p-3.5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-violet-700">
                  <UserRound aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500">User</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{currentUser}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-100 bg-white/75 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700"
              >
                <LogOut aria-hidden="true" className="size-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
