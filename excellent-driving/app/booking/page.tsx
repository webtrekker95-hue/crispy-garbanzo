import { prisma } from "@/lib/prisma";
import { BookingWizard } from "./booking-wizard";

const dayOrder = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
const packageDisplayOrder = ["Starter", "Standard", "Premium", "Refresher"];

function describeAvailability(days: string[]) {
  const set = new Set(days);
  if (dayOrder.every((d) => set.has(d))) return "Mon–Sat available";
  if (["MON", "TUE", "WED", "THU", "FRI"].every((d) => set.has(d)) && !set.has("SAT")) {
    return "Mon–Fri available";
  }
  const short: Record<string, string> = { MON: "Mon", TUE: "Tue", WED: "Wed", THU: "Thu", FRI: "Fri", SAT: "Sat" };
  return dayOrder.filter((d) => set.has(d)).map((d) => short[d]).join(", ") + " available";
}

export default async function BookingPage() {
  const [packagesRaw, instructors] = await Promise.all([
    prisma.package.findMany({ where: { isActive: true } }),
    prisma.instructor.findMany({
      where: { isActive: true },
      include: { user: true, schedules: true },
      orderBy: { yearsExperience: "desc" },
    }),
  ]);

  const orderOf = (name: string) => {
    const i = packageDisplayOrder.indexOf(name);
    return i === -1 ? packageDisplayOrder.length : i; // unknown packages sort last, not first
  };
  const packages = [...packagesRaw].sort((a, b) => orderOf(a.nameEn) - orderOf(b.nameEn));

  return (
    <BookingWizard
      packages={packages.map((p) => ({ id: p.id, nameEn: p.nameEn, price: Number(p.price) }))}
      instructors={instructors.map((i) => ({
        id: i.id,
        name: i.user.name,
        yearsExperience: i.yearsExperience,
        availableDays: describeAvailability(i.schedules.map((s) => s.dayOfWeek)),
      }))}
    />
  );
}
