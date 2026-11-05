"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({ children, currentUser }: { children: ReactNode; currentUser: string | null }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[linear-gradient(145deg,#d7f6fb_0%,#edf9ff_48%,#f8eefa_100%)] p-4 md:p-6">
        <div
          aria-hidden="true"
          className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-fuchsia-200/45 blur-3xl"
        />
        <div className="relative z-10 w-full max-w-[420px]">{children}</div>
      </main>
    );
  }

  return (
    <section className="grid min-h-dvh w-full lg:grid-cols-[250px_1fr] lg:gap-4 lg:p-6">
      <AppSidebar currentUser={currentUser ?? "User"} />
      <main className="min-h-dvh min-w-0 bg-zinc-50 p-4 pb-24 md:p-5 lg:min-h-[calc(100dvh-3rem)] lg:rounded-2xl lg:border lg:border-zinc-200">
        <div className="mb-4 flex items-center justify-between border-b border-zinc-200/80 pb-3 lg:hidden print:hidden">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Eboo Bakery"
              width={130}
              height={65}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>
        {children}
      </main>
    </section>
  );
}
