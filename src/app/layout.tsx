import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { PwaRegister } from "@/components/pwa-register";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eboo Bakery Dashboard",
  description: "Eboo Bakery management dashboard",
  applicationName: "Eboo Bakery Dashboard",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eboo Bakery Dashboard",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const currentUser = token ? verifyAuthToken(token)?.sub ?? null : null;

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-dvh bg-zinc-100">
        <PwaRegister />
        <AppShell currentUser={currentUser}>{children}</AppShell>
      </body>
    </html>
  );
}
