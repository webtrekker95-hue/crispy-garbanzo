import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const scheduleDaySchema = z.object({
  dayOfWeek: z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  bio: z.string().optional(),
  yearsExperience: z.number().int().min(0).optional(),
  schedule: z.array(scheduleDaySchema),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the instructor details." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const instructor = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: "INSTRUCTOR" },
    });
    const created = await tx.instructor.create({
      data: { userId: user.id, bio: parsed.data.bio, yearsExperience: parsed.data.yearsExperience, isActive: true },
    });
    if (parsed.data.schedule.length > 0) {
      await tx.schedule.createMany({
        data: parsed.data.schedule.map((s) => ({ ...s, instructorId: created.id })),
      });
    }
    return tx.instructor.findUnique({ where: { id: created.id }, include: { user: true, schedules: true } });
  });

  return NextResponse.json({ instructor }, { status: 201 });
}
