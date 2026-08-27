"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguageSwitcher({ className = "lang-switch" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLocale(next: "en" | "nl") {
    if (next === locale || pending) return;
    startTransition(async () => {
      await fetch("/api/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      router.refresh();
    });
  }

  return (
    <div className={className}>
      <button
        type="button"
        className={`lang-btn${locale === "en" ? " active" : ""}`}
        onClick={() => setLocale("en")}
        disabled={pending}
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-btn${locale === "nl" ? " active" : ""}`}
        onClick={() => setLocale("nl")}
        disabled={pending}
      >
        NL
      </button>
    </div>
  );
}
