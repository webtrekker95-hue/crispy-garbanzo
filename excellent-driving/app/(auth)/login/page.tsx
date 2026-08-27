"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    const session = await getSession();
    router.push(session?.user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--color-navy)]/10 p-8 shadow-sm"
      >
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-navy)]">
          Log in
        </h1>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <label className="block text-sm font-medium text-[var(--color-navy)]">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--color-navy)]/20 px-3 py-2 focus:border-[var(--color-amber)] focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-[var(--color-navy)]">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--color-navy)]/20 px-3 py-2 focus:border-[var(--color-amber)] focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[var(--color-amber)] px-6 py-3 font-semibold text-[var(--color-navy)] transition hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>

        <p className="text-center text-sm text-[var(--color-navy)]/60">
          No account?{" "}
          <a href="/register" className="font-semibold text-[var(--color-navy)] underline">
            Register
          </a>
        </p>
      </form>
    </main>
  );
}
