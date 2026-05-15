"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <main className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[440px] items-center justify-center md:min-h-[calc(100dvh-3rem)]">
        {children}
      </main>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-[1400px] gap-4 lg:grid-cols-[250px_1fr]">
      <AppSidebar />
      <main className="min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 pb-24 md:p-5">{children}</main>
    </section>
  );
}
