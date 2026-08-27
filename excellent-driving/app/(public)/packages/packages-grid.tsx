"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./packages.module.css";

type Pkg = {
  id: string;
  nameEn: string;
  descriptionEn: string;
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

const filters = [
  { value: "all", label: "All Packages" },
  { value: "beginner", label: "Beginner" },
  { value: "theory", label: "Includes Theory" },
  { value: "exam", label: "Exam Prep" },
];

export function PackagesGrid({ packages }: { packages: Pkg[] }) {
  const [filter, setFilter] = useState("all");

  const regular = packages.filter((p) => p.nameEn !== "Refresher");
  const refresher = packages.find((p) => p.nameEn === "Refresher");

  const matchesFilter = (name: string) =>
    filter === "all" || (packageMeta[name]?.tags ?? []).includes(filter);

  const visibleRegular = regular.filter((p) => matchesFilter(p.nameEn));
  const visibleRefresher = refresher && matchesFilter(refresher.nameEn) ? refresher : null;
  const totalVisible = visibleRegular.length + (visibleRefresher ? 1 : 0);

  return (
    <>
      <div className={styles["filter-bar"]}>
        <div>
          <div className={styles["filter-label"]}>Filter packages</div>
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
          Showing <strong>{totalVisible}</strong> packages
        </div>
      </div>

      <div className={styles["packages-grid"]}>
        {visibleRegular.map((pkg) => {
          const meta = packageMeta[pkg.nameEn];
          return (
            <div
              key={pkg.id}
              className={`${styles["package-card"]}${pkg.featured ? ` ${styles.featured}` : ""}`}
            >
              <div className={styles["package-header"]}>
                {pkg.featured && <div className={styles["popular-badge"]}>⭐ Most Popular</div>}
                <div className={styles["pkg-icon"]} aria-hidden="true">{meta.icon}</div>
                <div className={styles["pkg-name"]}>{pkg.nameEn}</div>
                <div className={styles["pkg-tagline"]}>{pkg.descriptionEn}</div>
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
                  Book {pkg.nameEn} Package
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
                <div className={styles["pkg-name"]}>Refresher</div>
                <div className={styles["pkg-tagline"]}>{visibleRefresher.descriptionEn}</div>
                <div className={styles["pkg-price-row"]}>
                  <div className={styles["pkg-price"]}>{visibleRefresher.price.toLocaleString()}</div>
                  <div className={styles["pkg-currency"]}>SRD</div>
                  <div className={styles["pkg-period"]}>/ package</div>
                </div>
              </div>
              <div className={styles["package-body"]}>
                <div className={styles["includes-title"]}>What&apos;s included</div>
                <div className={styles["includes-list"]}>
                  {packageMeta.Refresher.includes.map((item) => (
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
                  Book Refresher
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
