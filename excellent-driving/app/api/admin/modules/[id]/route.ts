import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const moduleSchema = z.object({
  titleEn: z.string().min(1),
  titleNl: z.string().min(1),
  orderIndex: z.number().int().min(1),
  isPublished: z.boolean(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parsed = moduleSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the module details." }, { status: 400 });

  const module = await prisma.module.update({ where: { id }, data: parsed.data, include: { lessons: true } });
  return NextResponse.json({ module });
}
