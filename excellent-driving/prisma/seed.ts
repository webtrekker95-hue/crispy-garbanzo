import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("ChangeMe123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@excellentdriving.sr" },
    update: {},
    create: {
      email: "admin@excellentdriving.sr",
      name: "School Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      language: "EN",
    },
  });

  const instructorPasswordHash = await bcrypt.hash("ChangeMe123!", 10);

  const instructorUser = await prisma.user.upsert({
    where: { email: "instructor@excellentdriving.sr" },
    update: {},
    create: {
      email: "instructor@excellentdriving.sr",
      name: "Ravi Doerga",
      passwordHash: instructorPasswordHash,
      role: "INSTRUCTOR",
      language: "EN",
    },
  });

  const instructor = await prisma.instructor.upsert({
    where: { userId: instructorUser.id },
    update: {},
    create: {
      userId: instructorUser.id,
      bio: "10+ years teaching new drivers across Paramaribo.",
      isActive: true,
    },
  });

  await prisma.schedule.createMany({
    data: [
      { instructorId: instructor.id, dayOfWeek: "MON", startTime: "08:00", endTime: "17:00" },
      { instructorId: instructor.id, dayOfWeek: "TUE", startTime: "08:00", endTime: "17:00" },
      { instructorId: instructor.id, dayOfWeek: "WED", startTime: "08:00", endTime: "17:00" },
      { instructorId: instructor.id, dayOfWeek: "THU", startTime: "08:00", endTime: "17:00" },
      { instructorId: instructor.id, dayOfWeek: "FRI", startTime: "08:00", endTime: "17:00" },
      { instructorId: instructor.id, dayOfWeek: "SAT", startTime: "09:00", endTime: "13:00" },
    ],
    skipDuplicates: true,
  });

  await prisma.package.upsert({
    where: { id: "seed-starter-package" },
    update: {},
    create: {
      id: "seed-starter-package",
      nameEn: "Starter",
      nameNl: "Starter",
      descriptionEn: "Perfect for first-time drivers with zero experience.",
      descriptionNl: "Perfect voor beginnende bestuurders zonder ervaring.",
      price: 2500,
      currency: "SRD",
      lessonCount: 0,
      includesTheory: true,
      isActive: true,
    },
  });

  await prisma.fAQ.createMany({
    data: [
      {
        question: "Do I need to bring my own car?",
        answer: "No — all practical lessons use our fully insured training vehicles.",
        language: "EN",
        orderIndex: 1,
      },
      {
        question: "Moet ik mijn eigen auto meenemen?",
        answer: "Nee — alle praktijklessen gebruiken onze volledig verzekerde lesauto's.",
        language: "NL",
        orderIndex: 1,
      },
      {
        question: "What payment methods do you accept?",
        answer: "Cash and bank transfer. Bank transfers are confirmed manually by our admin team.",
        language: "EN",
        orderIndex: 2,
      },
    ],
    skipDuplicates: true,
  });

  console.log({ admin: admin.email, instructor: instructorUser.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
