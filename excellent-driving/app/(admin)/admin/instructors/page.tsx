import { prisma } from "@/lib/prisma";
import { InstructorsManager } from "./instructors-manager";

export default async function AdminInstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    include: { user: true, schedules: true },
    orderBy: { user: { name: "asc" } },
  });

  const normalized = instructors.map((inst) => ({
    id: inst.id,
    name: inst.user.name,
    email: inst.user.email,
    bio: inst.bio ?? "",
    yearsExperience: inst.yearsExperience ?? 0,
    isActive: inst.isActive,
    schedule: Object.fromEntries(
      inst.schedules.map((s) => [s.dayOfWeek, { on: true, start: s.startTime, end: s.endTime }])
    ) as Record<string, { on: boolean; start: string; end: string }>,
  }));

  return <InstructorsManager initial={normalized} />;
}
