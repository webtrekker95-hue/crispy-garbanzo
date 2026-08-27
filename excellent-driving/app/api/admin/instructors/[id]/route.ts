import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const scheduleDaySchema = z.object({
  dayOfWeek: z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  yearsExperience: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  schedule: z.array(scheduleDaySchema).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the instructor details." }, { status: 400 });

  const { name, schedule, ...instructorFields } = parsed.data;

  const instructor = await prisma.$transaction(async (tx) => {
    const current = await tx.instructor.findUnique({ where: { id } });
    if (!current) return null;

    if (name) {
      await tx.user.update({ where: { id: current.userId }, data: { name } });
    }
    await tx.instructor.update({ where: { id }, data: instructorFields });

    if (schedule) {
      await tx.schedule.deleteMany({ where: { instructorId: id } });
      if (schedule.length > 0) {
        await tx.schedule.createMany({ data: schedule.map((s) => ({ ...s, instructorId: id })) });
      }
    }

    return tx.instructor.findUnique({ where: { id }, include: { user: true, schedules: true } });
  });

  if (!instructor) return NextResponse.json({ error: "Instructor not found." }, { status: 404 });
  return NextResponse.json({ instructor });
}
