import { prisma } from "@/lib/prisma";
import { BookingsTable } from "./bookings-table";

export default async function AdminBookingsPage() {
  const [bookings, instructors] = await Promise.all([
    prisma.booking.findMany({
      include: { student: true, package: true, instructor: { include: { user: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.instructor.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
  ]);

  const rows = bookings.map((b) => ({
    id: b.id,
    studentName: b.student.name,
    packageName: b.package.nameEn,
    dateLabel: b.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
    dateISO: b.date.toISOString().slice(0, 10),
    timeSlot: b.timeSlot,
    instructorName: b.instructor.user.name,
    instructorId: b.instructorId,
    paymentMethod: b.paymentMethod,
    paymentStatus: b.paymentStatus,
    status: b.status,
    price: Number(b.package.price),
  }));

  return (
    <BookingsTable
      initial={rows}
      instructors={instructors.map((i) => ({ id: i.id, name: i.user.name }))}
    />
  );
}
