import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppSidebar } from "@/components/app-sidebar";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toko Ebo Dashboard",
  description: "Toko Ebo management dashboard",
  applicationName: "Toko Ebo Dashboard",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Toko Ebo Dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-100 p-4 md:p-6">
        <PwaRegister />
        <section className="mx-auto grid w-full max-w-[1400px] gap-4 lg:grid-cols-[250px_1fr]">
          <AppSidebar />
          <main className="min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 pb-24 md:p-5">
            {children}
          </main>
        </section>
      </body>
    </html>
  );
}
