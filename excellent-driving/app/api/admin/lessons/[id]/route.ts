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

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parsed = lessonSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the lesson details." }, { status: 400 });

  const { content, ...rest } = parsed.data;
  const lesson = await prisma.lesson.update({
    where: { id },
    data: { ...rest, ...(content ? { content: content as Prisma.InputJsonValue } : {}) },
  });
  return NextResponse.json({ lesson });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
