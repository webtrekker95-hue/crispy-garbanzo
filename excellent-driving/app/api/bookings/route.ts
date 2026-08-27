import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayOfWeekCode, formatSlotLabel, generateSlotMinutes } from "@/lib/slots";

const bookingSchema = z.object({
  packageId: z.string().min(1),
  instructorId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().min(1),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER"]),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in to book a lesson." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details." }, { status: 400 });
  }

  const { packageId, instructorId, date: dateParam, timeSlot, paymentMethod } = parsed.data;
  const date = new Date(`${dateParam}T00:00:00Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dayCode = dayOfWeekCode(date);

  if (dayCode === "SUN" || date < today) {
    return NextResponse.json({ error: "That date is not available for booking." }, { status: 400 });
  }

  const [pkg, instructor, schedule] = await Promise.all([
    prisma.package.findUnique({ where: { id: packageId, isActive: true } }),
    prisma.instructor.findUnique({ where: { id: instructorId, isActive: true } }),
    prisma.schedule.findFirst({ where: { instructorId, dayOfWeek: dayCode } }),
  ]);

  if (!pkg) return NextResponse.json({ error: "Package not found." }, { status: 404 });
  if (!instructor) return NextResponse.json({ error: "Instructor not found." }, { status: 404 });
  if (!schedule) {
    return NextResponse.json(
      { error: "This instructor is not available on that day." },
      { status: 400 }
    );
  }

  const validSlots = generateSlotMinutes(
    schedule.startTime,
    schedule.endTime,
    schedule.slotDurationMinutes
  ).map(formatSlotLabel);
  if (!validSlots.includes(timeSlot)) {
    return NextResponse.json({ error: "That time slot is not available." }, { status: 400 });
  }

  const booking = await prisma.$transaction(async (tx) => {
    const clash = await tx.booking.findFirst({
      where: { instructorId, date, timeSlot, status: { not: "CANCELLED" } },
    });
    if (clash) return null;

    return tx.booking.create({
      data: {
        studentId: session.user.id,
        instructorId,
        packageId,
        date,
        timeSlot,
        paymentMethod,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
      include: { package: true, instructor: { include: { user: true } } },
    });
  });

  if (!booking) {
    return NextResponse.json(
      { error: "That slot was just booked by someone else. Please pick another." },
      { status: 409 }
    );
  }

  return NextResponse.json({ booking }, { status: 201 });
}
