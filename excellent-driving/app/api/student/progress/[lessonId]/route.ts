import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStudentModuleStates } from "@/lib/progress";

const submitSchema = z.object({
  answers: z.array(z.number().nullable()).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { courseAccess: true } });
  if (!user?.courseAccess) {
    return NextResponse.json({ error: "Your course access is currently on hold." }, { status: 403 });
  }

  const { lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

  const moduleStates = await getStudentModuleStates(session.user.id);
  const lessonState = moduleStates
    .flatMap((m) => m.lessons)
    .find((l) => l.lesson.id === lessonId);

  if (!lessonState?.unlocked) {
    return NextResponse.json({ error: "This lesson is locked." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const moduleId = lesson.moduleId;

  if (lesson.type === "QUIZ") {
    const content = lesson.content as {
      questions: { correct: number }[];
      passingScore?: number;
    };
    const answers = parsed.data.answers ?? [];
    const total = content.questions.length;
    const correctCount = content.questions.reduce(
      (count, q, i) => count + (answers[i] === q.correct ? 1 : 0),
      0
    );
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passingScore = content.passingScore ?? 70;
    const status = score >= passingScore ? "PASSED" : "FAILED";

    const progress = await prisma.studentProgress.upsert({
      where: { studentId_lessonId: { studentId: session.user.id, lessonId } },
      update: { status, score, completedAt: status === "PASSED" ? new Date() : null },
      create: { studentId: session.user.id, lessonId, moduleId, status, score, completedAt: status === "PASSED" ? new Date() : null },
    });

    return NextResponse.json({ progress, score, correctCount, total, passed: status === "PASSED" });
  }

  // TEXT / VIDEO lessons: submitting marks them complete, no scoring.
  const progress = await prisma.studentProgress.upsert({
    where: { studentId_lessonId: { studentId: session.user.id, lessonId } },
    update: { status: "PASSED", completedAt: new Date() },
    create: { studentId: session.user.id, lessonId, moduleId, status: "PASSED", completedAt: new Date() },
  });

  return NextResponse.json({ progress, passed: true });
}
