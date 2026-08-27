import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentModuleStates } from "@/lib/progress";
import styles from "../learn.module.css";

const typeLabels: Record<string, string> = { TEXT: "Text", QUIZ: "Quiz", VIDEO: "Video" };
const typeClass: Record<string, string> = { TEXT: "type-text", QUIZ: "type-quiz", VIDEO: "type-video" };

export default async function ModuleLessonsPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const session = await getServerSession(authOptions);
  const moduleStates = await getStudentModuleStates(session!.user.id);
  const moduleState = moduleStates.find((m) => m.module.id === moduleId);

  if (!moduleState) notFound();
  if (!moduleState.unlocked) {
    return (
      <div className={styles["lessons-card"]} style={{ padding: 24, textAlign: "center", color: "var(--gray-600)" }}>
        🔒 This module is locked. Complete the previous module first.
      </div>
    );
  }

  return (
    <div>
      <div className={styles["back-bar"]}>
        <Link href="/student/learn" className={styles["back-btn"]}>← My Lessons</Link>
        <div className={styles["back-title"]}>{moduleState.module.titleEn}</div>
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
                {isNext ? <strong>Lesson {i + 1}: {ls.lesson.title}</strong> : `Lesson ${i + 1}: ${ls.lesson.title}`}
              </div>
              <div className={`${styles["lesson-type"]} ${styles[typeClass[ls.lesson.type]]}`}>
                {typeLabels[ls.lesson.type]}
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
