"use client";

import { FormEvent, Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, LogIn, UserRound } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Login failed");
        return;
      }

      const nextPath = searchParams.get("next");
      const destination = nextPath && nextPath.startsWith("/") ? nextPath : "/";
      router.replace(destination);
      router.refresh();
    } catch {
      setError("Unable to connect to server");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/55 p-6 shadow-[0_24px_70px_rgba(73,61,112,0.14)] backdrop-blur-2xl sm:p-9">
      <div className="mb-7 text-center">
        <div className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl border border-violet-100 bg-violet-100/70 text-violet-700 shadow-sm">
          <LogIn aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </div>
        <Image
          src="/logo.png"
          alt="Eboo Bakery"
          width={180}
          height={90}
          className="mx-auto mb-5 h-11 w-auto object-contain"
          preload
        />
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">Sign in to manage your Eboo Bakery dashboard.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <label className="relative block">
          <span className="sr-only">Username</span>
          <UserRound
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            type="text"
            placeholder="Username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            className="h-12 w-full rounded-xl border border-white/80 bg-white/65 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white/85 focus:ring-4 focus:ring-violet-100/70"
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Password</span>
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            required
            className="h-12 w-full rounded-xl border border-white/80 bg-white/65 pl-10 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white/85 focus:ring-4 focus:ring-violet-100/70"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-600"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </label>

        {error ? (
          <p role="alert" className="rounded-xl border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          disabled={submitting}
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-violet-700 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-700/25 transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  );
}

function LoginPageFallback() {
  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/55 p-6 shadow-[0_24px_70px_rgba(73,61,112,0.14)] backdrop-blur-2xl sm:p-9">
      <div className="text-center">
        <Image
          src="/logo.png"
          alt="Eboo Bakery"
          width={180}
          height={90}
          className="mx-auto mb-5 h-11 w-auto object-contain"
          preload
        />
        <h1 className="text-2xl font-semibold text-zinc-900">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-600">Loading...</p>
      </div>
    </section>
  );
}
