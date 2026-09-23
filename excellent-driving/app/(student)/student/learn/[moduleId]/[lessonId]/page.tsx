import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentModuleStates } from "@/lib/progress";
import { TextLessonView } from "./text-lesson-view";
import { QuizLessonView } from "./quiz-lesson-view";
import styles from "./lesson.module.css";
import type { Situation } from "@/lib/maquette";

type WorkedExample = { situation: Situation; solution: string; explanation: string };
type TextContent = { type: "TEXT" | "VIDEO"; body?: string; description?: string; examples?: WorkedExample[] };
type QuizContent = {
  type: "QUIZ";
  questions: { text: string; options: string[]; correct: number; explanation: string; situation?: Situation }[];
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>;
}) {
  const { moduleId, lessonId } = await params;
  const session = await getServerSession(authOptions);
  const moduleStates = await getStudentModuleStates(session!.user.id);
  const moduleState = moduleStates.find((m) => m.module.id === moduleId);
  if (!moduleState) notFound();

  const lessonIndex = moduleState.lessons.findIndex((l) => l.lesson.id === lessonId);
  if (lessonIndex === -1) notFound();
  const lessonState = moduleState.lessons[lessonIndex];

  const moduleHref = `/student/learn/${moduleId}`;

  if (!lessonState.unlocked) {
    return (
      <div className={styles.wrap}>
        <div className={styles["back-bar"]}>
          <Link href={moduleHref} className={styles["back-btn"]}>← {moduleState.module.titleEn}</Link>
        </div>
        <div className={styles["text-card"]} style={{ textAlign: "center", color: "var(--gray-600)" }}>
          🔒 This lesson is locked. Complete the previous lesson first.
        </div>
      </div>
    );
  }

  // Completing *this* lesson is what unlocks the next one, so "next" always
  // points at it once it exists — no need to gate on its unlock state here.
  const nextLesson = moduleState.lessons[lessonIndex + 1];
  const nextHref = nextLesson ? `/student/learn/${moduleId}/${nextLesson.lesson.id}` : null;

  const lesson = lessonState.lesson;

  return (
    <div className={styles.wrap}>
      <div className={styles["back-bar"]}>
        <Link href={moduleHref} className={styles["back-btn"]}>← {moduleState.module.titleEn}</Link>
      </div>

      {lesson.type === "QUIZ" ? (
        <QuizLessonView
          lessonId={lesson.id}
          title={lesson.title}
          questions={(lesson.content as QuizContent).questions}
          nextHref={nextLesson ? `/student/learn/${moduleId}/${nextLesson.lesson.id}` : null}
          moduleHref={moduleHref}
        />
      ) : (
        <TextLessonView
          lessonId={lesson.id}
          title={lesson.title}
          body={(lesson.content as TextContent).body ?? (lesson.content as TextContent).description ?? ""}
          examples={(lesson.content as TextContent).examples}
          isVideo={lesson.type === "VIDEO"}
          alreadyComplete={lessonState.status === "PASSED"}
          nextHref={nextHref}
          moduleHref={moduleHref}
        />
      )}
    </div>
  );
}
