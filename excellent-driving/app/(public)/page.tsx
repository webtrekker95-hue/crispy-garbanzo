import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-[var(--color-navy)] px-6 py-24 text-center text-white">
      <p className="text-sm font-semibold tracking-wide text-[var(--color-amber)]">
        Phase 1 — scaffold placeholder
      </p>
      <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl">
        Learn to Drive with Confidence
      </h1>
      <p className="max-w-xl text-white/70">
        This is the real Next.js app. Full page content will be built to
        match the approved maquettes in{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5">maquettes/01-homepage.html</code>{" "}
        (AGENT 4, Phase 2).
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/login"
          className="rounded-full bg-[var(--color-amber)] px-6 py-3 font-semibold text-[var(--color-navy)] transition hover:brightness-110"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
