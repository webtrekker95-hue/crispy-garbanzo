import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  language: z.enum(["EN", "NL"]),
  orderIndex: z.number().int().min(0),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parsed = faqSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the FAQ details." }, { status: 400 });

  const faq = await prisma.fAQ.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ faq });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  await prisma.fAQ.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
