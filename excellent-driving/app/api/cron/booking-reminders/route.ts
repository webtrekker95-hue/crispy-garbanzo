import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notify, templates } from "@/lib/whatsapp";

/**
 * Intended to run daily at 8AM via Vercel Cron (see vercel.json) or any
 * external scheduler hitting this URL. Sends a reminder for every
 * non-cancelled booking scheduled for tomorrow.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const tomorrow = new Date();
  tomorrow.setUTCHours(0, 0, 0, 0);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: { date: tomorrow, status: { not: "CANCELLED" } },
    include: { student: true, instructor: { include: { user: true } } },
  });

  const results = await Promise.all(
    bookings.map((booking) =>
      notify({
        phone: booking.student.phone,
        email: booking.student.email,
        subject: "Reminder: your driving lesson is tomorrow",
        message: templates.bookingReminder({
          time: booking.timeSlot,
          instructor: booking.instructor.user.name,
        }),
      })
    )
  );

  return NextResponse.json({
    date: tomorrow.toISOString().slice(0, 10),
    remindersSent: results.filter((r) => r.success).length,
    total: bookings.length,
  });
}
