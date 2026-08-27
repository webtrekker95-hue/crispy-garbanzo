import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const moduleSchema = z.object({
  titleEn: z.string().min(1),
  titleNl: z.string().min(1),
  orderIndex: z.number().int().min(1),
  isPublished: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  const parsed = moduleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the module details." }, { status: 400 });

  const module = await prisma.module.create({
    data: { ...parsed.data, isPublished: parsed.data.isPublished ?? false },
    include: { lessons: true },
  });
  return NextResponse.json({ module }, { status: 201 });
}
