import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ locale: z.enum(["en", "nl"]) });

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid locale." }, { status: 400 });

  const cookieStore = await cookies();
  cookieStore.set("locale", parsed.data.locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  // If logged in, persist the preference to the User record too, per Claude.md.
  const session = await getServerSession(authOptions);
  if (session?.user) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { language: parsed.data.locale.toUpperCase() as "EN" | "NL" },
    });
  }

  return NextResponse.json({ ok: true });
}
