import { prisma } from "@/lib/prisma";
import type { Lesson, Module, ProgressStatus } from "@prisma/client";

export type LessonState = {
  lesson: Lesson;
  status: ProgressStatus;
  score: number | null;
  unlocked: boolean;
};

export type ModuleState = {
  module: Module;
  lessons: LessonState[];
  completedCount: number;
  totalLessons: number;
  pct: number;
  unlocked: boolean;
  complete: boolean;
};

/**
 * A module unlocks once the previous module is fully complete; a lesson
 * unlocks once its module is unlocked AND the previous lesson in that
 * module has status PASSED. Module 1 / lesson 1 are always unlocked.
 */
export async function getStudentModuleStates(studentId: string): Promise<ModuleState[]> {
  const modules = await prisma.module.findMany({
    where: { isPublished: true },
    include: { lessons: { orderBy: { orderIndex: "asc" } } },
    orderBy: { orderIndex: "asc" },
  });

  const progress = await prisma.studentProgress.findMany({ where: { studentId } });
  const progressByLesson = new Map(progress.map((p) => [p.lessonId, p]));

  let previousModuleComplete = true;
  const states: ModuleState[] = [];

  for (const mod of modules) {
    const moduleUnlocked = previousModuleComplete;
    let previousLessonComplete = true;
    const lessonStates: LessonState[] = mod.lessons.map((lesson) => {
      const p = progressByLesson.get(lesson.id);
      const status = p?.status ?? "NOT_STARTED";
      const unlocked = moduleUnlocked && previousLessonComplete;
      previousLessonComplete = status === "PASSED";
      return { lesson, status, score: p?.score ?? null, unlocked };
    });

    const completedCount = lessonStates.filter((l) => l.status === "PASSED").length;
    const totalLessons = mod.lessons.length;
    const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const complete = totalLessons > 0 && completedCount === totalLessons;

    states.push({ module: mod, lessons: lessonStates, completedCount, totalLessons, pct, unlocked: moduleUnlocked, complete });
    previousModuleComplete = complete;
  }

  return states;
}

export async function getStudentDashboardStats(studentId: string) {
  const [passedProgress, allProgress, upcomingBookings] = await Promise.all([
    prisma.studentProgress.findMany({
      where: { studentId, status: "PASSED" },
      include: { lesson: true },
    }),
    prisma.studentProgress.findMany({
      where: { studentId, score: { not: null } },
    }),
    prisma.booking.count({
      where: { studentId, status: { not: "CANCELLED" }, date: { gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) } },
    }),
  ]);

  const quizzesPassed = passedProgress.filter((p) => p.lesson.type === "QUIZ").length;
  const avgQuizScore =
    allProgress.length > 0
      ? Math.round(allProgress.reduce((sum, p) => sum + (p.score ?? 0), 0) / allProgress.length)
      : null;

  return {
    lessonsCompleted: passedProgress.length,
    quizzesPassed,
    upcomingBookings,
    avgQuizScore,
  };
}
