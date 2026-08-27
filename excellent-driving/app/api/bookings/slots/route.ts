import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dayOfWeekCode, formatSlotLabel, generateSlotMinutes } from "@/lib/slots";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get("instructorId");
  const dateParam = searchParams.get("date"); // YYYY-MM-DD

  if (!instructorId || !dateParam) {
    return NextResponse.json({ error: "instructorId and date are required" }, { status: 400 });
  }

  const date = new Date(`${dateParam}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dayCode = dayOfWeekCode(date);

  if (dayCode === "SUN" || date < today) {
    return NextResponse.json({ slots: [] });
  }

  const schedule = await prisma.schedule.findFirst({
    where: { instructorId, dayOfWeek: dayCode },
  });

  if (!schedule) {
    return NextResponse.json({ slots: [] });
  }

  const existingBookings = await prisma.booking.findMany({
    where: {
      instructorId,
      date,
      status: { not: "CANCELLED" },
    },
    select: { timeSlot: true },
  });
  const bookedSlots = new Set(existingBookings.map((b) => b.timeSlot));

  const slotMinutes = generateSlotMinutes(
    schedule.startTime,
    schedule.endTime,
    schedule.slotDurationMinutes
  );

  const slots = slotMinutes.map((minutes) => {
    const label = formatSlotLabel(minutes);
    return { label, booked: bookedSlots.has(label) };
  });

  return NextResponse.json({ slots });
}
