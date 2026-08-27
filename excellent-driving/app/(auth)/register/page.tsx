"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    language: "EN",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Registration failed.");
      setSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error) {
      router.push("/login");
      return;
    }

    router.push("/student/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--color-navy)]/10 p-8 shadow-sm"
      >
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-navy)]">
          Create your account
        </h1>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <label className="block text-sm font-medium text-[var(--color-navy)]">
          Full name
          <input
            required
            value={form.name}
            onChange={update("name")}
            className="mt-1 w-full rounded-lg border border-[var(--color-navy)]/20 px-3 py-2 focus:border-[var(--color-amber)] focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-[var(--color-navy)]">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            className="mt-1 w-full rounded-lg border border-[var(--color-navy)]/20 px-3 py-2 focus:border-[var(--color-amber)] focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-[var(--color-navy)]">
          Phone
          <input
            value={form.phone}
            onChange={update("phone")}
            className="mt-1 w-full rounded-lg border border-[var(--color-navy)]/20 px-3 py-2 focus:border-[var(--color-amber)] focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-[var(--color-navy)]">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={update("password")}
            className="mt-1 w-full rounded-lg border border-[var(--color-navy)]/20 px-3 py-2 focus:border-[var(--color-amber)] focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-[var(--color-navy)]">
          Language
          <select
            value={form.language}
            onChange={update("language")}
            className="mt-1 w-full rounded-lg border border-[var(--color-navy)]/20 px-3 py-2 focus:border-[var(--color-amber)] focus:outline-none"
          >
            <option value="EN">English</option>
            <option value="NL">Nederlands</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[var(--color-amber)] px-6 py-3 font-semibold text-[var(--color-navy)] transition hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-sm text-[var(--color-navy)]/60">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-[var(--color-navy)] underline">
            Log in
          </a>
        </p>
      </form>
    </main>
  );
}
