import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSlotLabel } from "@/lib/slots";
import { notify, templates } from "@/lib/whatsapp";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { student: true } });

  if (!booking || booking.studentId !== session.user.id) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "This booking is already cancelled." }, { status: 400 });
  }

  const lessonStart = new Date(booking.date);
  lessonStart.setUTCMinutes(lessonStart.getUTCMinutes() + parseSlotLabel(booking.timeSlot));
  const hoursUntilLesson = (lessonStart.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursUntilLesson < 24) {
    return NextResponse.json(
      { error: "Bookings can only be cancelled at least 24 hours in advance." },
      { status: 400 }
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  await notify({
    phone: booking.student.phone,
    email: booking.student.email,
    subject: "Your Excellent Driving booking was cancelled",
    message: templates.bookingCancelled({
      date: booking.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }),
      time: booking.timeSlot,
    }),
  });

  return NextResponse.json({ booking: updated });
}
