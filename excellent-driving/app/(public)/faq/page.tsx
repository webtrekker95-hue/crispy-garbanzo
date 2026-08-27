import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FaqList } from "./faq-list";
import styles from "./faq.module.css";

export default async function FaqPage() {
  const [en, nl] = await Promise.all([
    prisma.fAQ.findMany({ where: { language: "EN" }, orderBy: { orderIndex: "asc" } }),
    prisma.fAQ.findMany({ where: { language: "NL" }, orderBy: { orderIndex: "asc" } }),
  ]);

  return (
    <>
      <div className={styles["page-header"]}>
        <div className={styles["page-header-inner"]}>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>FAQ</span>
          </div>
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about starting your driving lessons.</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles["content-inner"]}>
          <FaqList
            en={en.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
            nl={nl.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
          />
        </div>
      </div>
    </>
  );
}
