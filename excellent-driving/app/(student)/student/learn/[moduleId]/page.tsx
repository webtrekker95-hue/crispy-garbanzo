import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLocale, getTranslations } from "next-intl/server";
import { getStudentModuleStates, moduleTitle } from "@/lib/progress";
import styles from "../learn.module.css";

const typeLabelKeys = { TEXT: "typeText", QUIZ: "typeQuiz", VIDEO: "typeVideo" } as const;
const typeClass: Record<string, string> = { TEXT: "type-text", QUIZ: "type-quiz", VIDEO: "type-video" };

export default async function ModuleLessonsPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const session = await getServerSession(authOptions);
  const moduleStates = await getStudentModuleStates(session!.user.id);
  const locale = await getLocale();
  const t = await getTranslations("Learn");
  const moduleState = moduleStates.find((m) => m.module.id === moduleId);

  if (!moduleState) notFound();
  if (!moduleState.unlocked) {
    return (
      <div className={styles["lessons-card"]} style={{ padding: 24, textAlign: "center", color: "var(--gray-600)" }}>
        🔒 {t("moduleLocked")}
      </div>
    );
  }

  return (
    <div>
      <div className={styles["back-bar"]}>
        <Link href="/student/learn" className={styles["back-btn"]}>← {t("myLessons")}</Link>
        <div className={styles["back-title"]}>{moduleTitle(moduleState.module, locale)}</div>
      </div>

      <div className={styles["lessons-card"]}>
        {moduleState.lessons.map((ls, i) => {
          const isDone = ls.status === "PASSED";
          const isNext = ls.unlocked && !isDone;
          const numClass = isDone ? styles.done : isNext ? styles.active : "";
          const content = (
            <>
              <div className={`${styles["lesson-num"]} ${numClass}`}>{isDone ? "✓" : ls.unlocked ? i + 1 : "🔒"}</div>
              <div className={styles["lesson-name"]}>
                {isNext ? <strong>{t("lessonHeading", { number: i + 1, title: ls.lesson.title })}</strong> : t("lessonHeading", { number: i + 1, title: ls.lesson.title })}
              </div>
              <div className={`${styles["lesson-type"]} ${styles[typeClass[ls.lesson.type]]}`}>
                {t(typeLabelKeys[ls.lesson.type])}
              </div>
            </>
          );

          return ls.unlocked ? (
            <Link
              key={ls.lesson.id}
              href={`/student/learn/${moduleId}/${ls.lesson.id}`}
              className={`${styles["lesson-item"]} ${styles.clickable}`}
            >
              {content}
            </Link>
          ) : (
            <div key={ls.lesson.id} className={`${styles["lesson-item"]} ${styles.locked}`}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
