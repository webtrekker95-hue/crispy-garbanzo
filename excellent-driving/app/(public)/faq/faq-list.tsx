"use client";

import { useState } from "react";
import { FaqAccordion, type FaqItem } from "@/components/faq-accordion";
import styles from "./faq.module.css";

export function FaqList({ en, nl }: { en: FaqItem[]; nl: FaqItem[] }) {
  const [lang, setLang] = useState<"en" | "nl">("en");
  const items = lang === "en" ? en : nl;

  return (
    <>
      <div className={styles["filter-bar"]}>
        <div className={styles["filter-label"]}>Filter by language</div>
        <div className={styles["filter-tabs"]}>
          <button
            type="button"
            className={`${styles["filter-tab"]}${lang === "en" ? ` ${styles.active}` : ""}`}
            onClick={() => setLang("en")}
          >
            English
          </button>
          <button
            type="button"
            className={`${styles["filter-tab"]}${lang === "nl" ? ` ${styles.active}` : ""}`}
            onClick={() => setLang("nl")}
          >
            Nederlands
          </button>
        </div>
      </div>

      {items.length > 0 ? (
        <FaqAccordion items={items} />
      ) : (
        <p style={{ color: "var(--gray-600)", fontSize: "0.9rem" }}>
          No questions available in this language yet.
        </p>
      )}
    </>
  );
}
