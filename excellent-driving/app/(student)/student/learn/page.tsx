import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLocale, getTranslations } from "next-intl/server";
import { getStudentModuleStates, moduleTitle } from "@/lib/progress";
import styles from "./learn.module.css";

const moduleIcons = ["📖", "🚦", "🛣️", "🚗", "🏁"];

export default async function LearnPage() {
  const session = await getServerSession(authOptions);
  const moduleStates = await getStudentModuleStates(session!.user.id);
  const locale = await getLocale();
  const t = await getTranslations("Learn");

  return (
    <div>
      {moduleStates.map((m, i) => {
        const statusLabel = m.complete ? `✓ ${t("statusComplete")}` : !m.unlocked ? `🔒 ${t("statusLocked")}` : m.completedCount > 0 ? t("statusInProgress") : t("statusNotStarted");
        const statusClass = m.complete ? styles["status-done"] : !m.unlocked ? styles["status-locked"] : styles["status-progress"];
        const fillColor = m.complete ? "var(--green)" : !m.unlocked ? "var(--gray-200)" : "var(--amber)";
        const card = (
          <div className={styles["module-card-header"]}>
            <div className={styles["mod-icon"]} style={{ background: m.complete ? "var(--green-light)" : !m.unlocked ? "var(--gray-100)" : "rgba(245,166,35,0.12)" }} aria-hidden="true">
              {moduleIcons[i] ?? "📘"}
            </div>
            <div className={styles["mod-info"]}>
              <div className={styles["mod-name"]}>{t("moduleHeading", { number: i + 1, title: moduleTitle(m.module, locale) })}</div>
              <div className={styles["mod-progress-wrap"]}>
                <div className={styles["mod-bar"]}>
                  <div className={styles["mod-fill"]} style={{ width: `${m.pct}%`, background: fillColor }}></div>
                </div>
                <div className={styles["mod-pct"]} style={{ color: fillColor === "var(--gray-200)" ? "var(--gray-600)" : fillColor }}>{m.pct}%</div>
              </div>
            </div>
            <div className={styles["mod-meta"]}>
              <div className={styles["mod-lessons-count"]}>{t("lessonsCount", { done: m.completedCount, total: m.totalLessons })}</div>
              <div className={`${styles["mod-status-pill"]} ${statusClass}`}>{statusLabel}</div>
            </div>
            {m.unlocked && <div className={styles["mod-arrow"]} aria-hidden="true">→</div>}
          </div>
        );

        return m.unlocked ? (
          <Link href={`/student/learn/${m.module.id}`} className={styles["module-card"]} key={m.module.id}>
            {card}
          </Link>
        ) : (
          <div className={`${styles["module-card"]} ${styles.locked}`} key={m.module.id}>
            {card}
          </div>
        );
      })}
    </div>
  );
}
