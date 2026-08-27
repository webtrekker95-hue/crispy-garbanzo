import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  language: z.enum(["EN", "NL"]),
  orderIndex: z.number().int().min(0).optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  const parsed = faqSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the FAQ details." }, { status: 400 });

  const faq = await prisma.fAQ.create({ data: { ...parsed.data, orderIndex: parsed.data.orderIndex ?? 0 } });
  return NextResponse.json({ faq }, { status: 201 });
}
