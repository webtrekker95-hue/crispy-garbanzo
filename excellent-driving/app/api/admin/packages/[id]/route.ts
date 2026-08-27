import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const packageSchema = z.object({
  nameEn: z.string().min(1),
  nameNl: z.string().min(1),
  descriptionEn: z.string().min(1),
  descriptionNl: z.string().min(1),
  price: z.number().positive(),
  lessonCount: z.number().int().min(0),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parsed = packageSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the package details." }, { status: 400 });

  const pkg = await prisma.package.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ package: pkg });
}
