"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import styles from "./packages.module.css";

type Pkg = {
  id: string;
  nameEn: string;
  nameNl: string;
  descriptionEn: string;
  descriptionNl: string;
  price: number;
  featured: boolean;
};

const packageMeta: Record<
  string,
  { icon: string; tags: string[]; stats: { num: string; label: string }[]; includes: { text: string; included: boolean }[] }
> = {
  Starter: {
    icon: "🚀",
    tags: ["beginner"],
    stats: [
      { num: "0", label: "Practical Lessons" },
      { num: "✓", label: "Theory" },
    ],
    includes: [
      { text: "Practical lessons are not included, theory only", included: false },
      { text: "Online theory course access", included: true },
      { text: "Practice quizzes (unlimited retries)", included: true },
      { text: "WhatsApp booking support", included: true },
      { text: "Completion certificate", included: true },
      { text: "Mock exam sessions", included: false },
      { text: "Exam day accompaniment", included: false },
    ],
  },
  Standard: {
    icon: "🎯",
    tags: ["beginner", "theory"],
    stats: [
      { num: "0", label: "Practical Lessons" },
      { num: "2", label: "Mock exams" },
    ],
    includes: [
      { text: "Practical lessons are not included, theory only", included: false },
      { text: "Full theory course + video content", included: true },
      { text: "2 official mock exam sessions", included: true },
      { text: "Priority booking slots", included: true },
      { text: "WhatsApp support + reminders", included: true },
      { text: "Completion certificate", included: true },
      { text: "Exam day accompaniment", included: false },
    ],
  },
  Premium: {
    icon: "💎",
    tags: ["theory", "exam"],
    stats: [
      { num: "0", label: "Practical Lessons" },
      { num: "∞", label: "Mock exams" },
    ],
    includes: [
      { text: "Practical lessons are not included, theory only", included: false },
      { text: "Full theory + video lesson library", included: true },
      { text: "Unlimited mock exam sessions", included: true },
      { text: "Priority booking — first pick always", included: true },
      { text: "Dedicated instructor assignment", included: true },
      { text: "Exam day accompaniment by instructor", included: true },
      { text: "Pass guarantee or extra lessons free", included: true },
    ],
  },
  Refresher: {
    icon: "🔄",
    tags: ["exam"],
    stats: [],
    includes: [
      { text: "Practical lessons are not included, theory only", included: false },
      { text: "1 mock exam session", included: true },
      { text: "Theory quiz access (30 days)", included: true },
      { text: "Full theory course", included: false },
    ],
  },
};

const fallbackIncludes = [
  { text: "Practical lessons are not included, theory only", included: false },
  { text: "Online theory course access", included: true },
  { text: "WhatsApp support", included: true },
  { text: "Completion certificate", included: true },
];

/** Every known package has hand-tuned copy above; anything else (e.g. a
 * package created later in the admin panel) falls back to generic content
 * derived from real fields, instead of crashing on an unrecognized name. */
function getMeta(name: string) {
  return packageMeta[name] ?? { icon: "🚗", tags: [] as string[], stats: [], includes: fallbackIncludes };
}

export function PackagesGrid({ packages }: { packages: Pkg[] }) {
  const t = useTranslations("Packages");
  const locale = useLocale();
  const isNl = locale === "nl";
  const [filter, setFilter] = useState("all");

  const filters = [
    { value: "all", label: t("filterAll") },
    { value: "beginner", label: t("filterBeginner") },
    { value: "theory", label: t("filterTheory") },
    { value: "exam", label: t("filterExam") },
  ];

  const regular = packages.filter((p) => p.nameEn !== "Refresher");
  const refresher = packages.find((p) => p.nameEn === "Refresher");

  const matchesFilter = (name: string) => filter === "all" || getMeta(name).tags.includes(filter);

  const visibleRegular = regular.filter((p) => matchesFilter(p.nameEn));
  const visibleRefresher = refresher && matchesFilter(refresher.nameEn) ? refresher : null;
  const totalVisible = visibleRegular.length + (visibleRefresher ? 1 : 0);

  return (
    <>
      <div className={styles["filter-bar"]}>
        <div>
          <div className={styles["filter-label"]}>{t("filterLabel")}</div>
        </div>
        <div className={styles["filter-tabs"]}>
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`${styles["filter-tab"]}${filter === f.value ? ` ${styles.active}` : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className={styles["result-count"]}>
          {t("showing")} <strong>{totalVisible}</strong> {t("packagesWord")}
        </div>
      </div>

      <div className={styles["packages-grid"]}>
        {visibleRegular.map((pkg) => {
          const meta = getMeta(pkg.nameEn);
          return (
            <div
              key={pkg.id}
              className={`${styles["package-card"]}${pkg.featured ? ` ${styles.featured}` : ""}`}
            >
              <div className={styles["package-header"]}>
                {pkg.featured && <div className={styles["popular-badge"]}>⭐ {t("mostPopular")}</div>}
                <div className={styles["pkg-icon"]} aria-hidden="true">{meta.icon}</div>
                <div className={styles["pkg-name"]}>{isNl ? pkg.nameNl : pkg.nameEn}</div>
                <div className={styles["pkg-tagline"]}>{isNl ? pkg.descriptionNl : pkg.descriptionEn}</div>
                <div className={styles["pkg-price-row"]}>
                  <div className={styles["pkg-price"]}>{pkg.price.toLocaleString()}</div>
                  <div className={styles["pkg-currency"]}>SRD</div>
                  <div className={styles["pkg-period"]}>/ package</div>
                </div>
              </div>
              <div className={styles["package-body"]}>
                <div className={styles["pkg-stats"]}>
                  {meta.stats.map((stat) => (
                    <div className={styles["pkg-stat"]} key={stat.label}>
                      <div className={styles["pkg-stat-num"]}>{stat.num}</div>
                      <div className={styles["pkg-stat-label"]}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className={styles["includes-title"]}>What&apos;s included</div>
                <div className={styles["includes-list"]}>
                  {meta.includes.map((item) => (
                    <div
                      key={item.text}
                      className={`${styles["include-item"]}${item.included ? "" : ` ${styles.unavailable}`}`}
                    >
                      <div className={item.included ? styles["check-icon"] : styles["cross-icon"]}>
                        {item.included ? "✓" : "✗"}
                      </div>
                      {item.text}
                    </div>
                  ))}
                </div>
                <Link
                  href="/booking"
                  className={`btn ${pkg.featured ? "btn-primary" : "btn-outline"} ${styles["pkg-cta"]}`}
                >
                  {t("bookPackage", { name: isNl ? pkg.nameNl : pkg.nameEn })}
                </Link>
              </div>
            </div>
          );
        })}

        {visibleRefresher && (
          <div className={`${styles["package-card"]} ${styles["refresher-card"]}`}>
            <div className={styles["refresher-inner"]}>
              <div className={`${styles["package-header"]} ${styles["refresher-header"]}`}>
                <div className={styles["pkg-icon"]} aria-hidden="true">🔄</div>
                <div className={styles["pkg-name"]}>{isNl ? visibleRefresher.nameNl : "Refresher"}</div>
                <div className={styles["pkg-tagline"]}>{isNl ? visibleRefresher.descriptionNl : visibleRefresher.descriptionEn}</div>
                <div className={styles["pkg-price-row"]}>
                  <div className={styles["pkg-price"]}>{visibleRefresher.price.toLocaleString()}</div>
                  <div className={styles["pkg-currency"]}>SRD</div>
                  <div className={styles["pkg-period"]}>/ package</div>
                </div>
              </div>
              <div className={styles["package-body"]}>
                <div className={styles["includes-title"]}>What&apos;s included</div>
                <div className={styles["includes-list"]}>
                  {getMeta("Refresher").includes.map((item) => (
                    <div
                      key={item.text}
                      className={`${styles["include-item"]}${item.included ? "" : ` ${styles.unavailable}`}`}
                    >
                      <div className={item.included ? styles["check-icon"] : styles["cross-icon"]}>
                        {item.included ? "✓" : "✗"}
                      </div>
                      {item.text}
                    </div>
                  ))}
                </div>
                <Link
                  href="/booking"
                  className={`btn btn-outline ${styles["pkg-cta"]}`}
                  style={{ marginTop: "auto" }}
                >
                  {t("bookRefresher")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
