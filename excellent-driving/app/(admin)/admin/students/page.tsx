import { prisma } from "@/lib/prisma";
import { StudentsManager, type StudentRow } from "./students-manager";

export default async function AdminStudentsPage() {
  const [students, modules, allProgress] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.module.findMany({
      where: { isPublished: true },
      include: { lessons: { select: { id: true } } },
      orderBy: { orderIndex: "asc" },
    }),
    // One query for every student's progress, instead of N queries.
    prisma.studentProgress.findMany({ where: { status: "PASSED" }, select: { studentId: true, lessonId: true } }),
  ]);

  const lessonToModule = new Map<string, string>();
  for (const m of modules) for (const l of m.lessons) lessonToModule.set(l.id, m.id);

  const passedByStudent = new Map<string, Set<string>>();
  for (const p of allProgress) {
    if (!passedByStudent.has(p.studentId)) passedByStudent.set(p.studentId, new Set());
    passedByStudent.get(p.studentId)!.add(p.lessonId);
  }

  const rows: StudentRow[] = students.map((s) => {
    const passedLessonIds = passedByStudent.get(s.id) ?? new Set<string>();
    const moduleBreakdown = modules.map((m) => ({
      title: m.titleEn,
      completed: m.lessons.filter((l) => passedLessonIds.has(l.id)).length,
      total: m.lessons.length,
    }));
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const lessonsCompleted = [...passedLessonIds].filter((id) => lessonToModule.has(id)).length;

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone ?? "",
      language: s.language,
      courseAccess: s.courseAccess,
      createdAt: s.createdAt.toISOString(),
      bookingsCount: s._count.bookings,
      lessonsCompleted,
      totalLessons,
      moduleBreakdown,
    };
  });

  return <StudentsManager initial={rows} />;
}
