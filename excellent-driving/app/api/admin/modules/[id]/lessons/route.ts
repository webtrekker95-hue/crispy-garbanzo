import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const lessonSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["TEXT", "QUIZ", "VIDEO"]),
  orderIndex: z.number().int().min(1),
  content: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id: moduleId } = await params;
  const body = await request.json();
  const parsed = lessonSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the lesson details." }, { status: 400 });

  const lesson = await prisma.lesson.create({
    data: { ...parsed.data, moduleId, content: parsed.data.content as Prisma.InputJsonValue },
  });
  return NextResponse.json({ lesson }, { status: 201 });
}
