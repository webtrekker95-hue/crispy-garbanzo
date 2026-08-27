import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  schoolName: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  whatsappNumber: z.string(),
  whatsappBotEnabled: z.boolean(),
  defaultLanguage: z.enum(["EN", "NL"]),
});

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the settings." }, { status: 400 });

  const settings = await prisma.schoolSettings.upsert({
    where: { id: "school" },
    update: parsed.data,
    create: { id: "school", ...parsed.data },
  });

  return NextResponse.json({ settings });
}
