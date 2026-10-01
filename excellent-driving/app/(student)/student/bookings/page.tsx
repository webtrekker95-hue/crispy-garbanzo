import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSlotLabel } from "@/lib/slots";
import { BookingsList, type BookingRow } from "./bookings-list";

function hoursUntilLesson(date: Date, timeSlot: string) {
  const lessonStart = new Date(date);
  lessonStart.setUTCMinutes(lessonStart.getUTCMinutes() + parseSlotLabel(timeSlot));
  return (lessonStart.getTime() - Date.now()) / (1000 * 60 * 60);
}

export default async function StudentBookingsPage() {
  const session = await getServerSession(authOptions);
  const bookings = await prisma.booking.findMany({
    where: { studentId: session!.user.id },
    include: { package: true, instructor: { include: { user: true } } },
    orderBy: { date: "desc" },
  });

  const rows: BookingRow[] = bookings.map((b) => {
    const hoursUntil = hoursUntilLesson(b.date, b.timeSlot);

    return {
      id: b.id,
      date: b.date.toISOString(),
      timeSlot: b.timeSlot,
      status: b.status,
      paymentMethod: b.paymentMethod,
      paymentStatus: b.paymentStatus,
      packageName: b.package.nameEn,
      instructorName: b.instructor.user.name,
      canCancel: b.status !== "CANCELLED" && hoursUntil >= 24,
    };
  });

  return <BookingsList initial={rows} />;
}
