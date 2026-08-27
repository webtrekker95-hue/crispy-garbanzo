import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { studentId: session.user.id },
    include: { package: true, instructor: { include: { user: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ bookings });
}
