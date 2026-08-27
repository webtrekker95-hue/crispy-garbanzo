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

  const instructorSeeds = [
    {
      email: "carlos@excellentdriving.sr",
      name: "Carlos Martinus",
      yearsExperience: 12,
      bio: "Specializes in nervous beginners. Calm, patient teaching style with focus on road safety.",
      schedule: ["MON", "TUE", "WED", "THU", "FRI", "SAT"] as const,
    },
    {
      email: "sandra@excellentdriving.sr",
      name: "Sandra Pengel",
      yearsExperience: 8,
      bio: "Expert in city driving and parking techniques. Available Monday through Friday.",
      schedule: ["MON", "TUE", "WED", "THU", "FRI"] as const,
    },
    {
      email: "roy@excellentdriving.sr",
      name: "Roy Apensa",
      yearsExperience: 15,
      bio: "Former driving examiner. Knows exactly what examiners look for. 97% pass rate.",
      schedule: ["MON", "TUE", "WED", "THU", "FRI", "SAT"] as const,
    },
  ];

  const instructorPasswordHash = await bcrypt.hash("ChangeMe123!", 10);
  const instructors = [];

  for (const seed of instructorSeeds) {
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: {},
      create: {
        email: seed.email,
        name: seed.name,
        passwordHash: instructorPasswordHash,
        role: "INSTRUCTOR",
        language: "EN",
      },
    });

    const instructor = await prisma.instructor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: seed.bio,
        yearsExperience: seed.yearsExperience,
        isActive: true,
      },
    });

    await prisma.schedule.createMany({
      data: seed.schedule.map((dayOfWeek) => ({
        instructorId: instructor.id,
        dayOfWeek,
        startTime: dayOfWeek === "SAT" ? "09:00" : "08:00",
        endTime: dayOfWeek === "SAT" ? "13:00" : "17:00",
      })),
      skipDuplicates: true,
    });

    instructors.push(instructor);
  }

  const packageSeeds = [
    {
      id: "seed-pkg-starter",
      nameEn: "Starter",
      nameNl: "Starter",
      descriptionEn: "Perfect for beginners with no prior driving experience.",
      descriptionNl: "Perfect voor beginners zonder eerdere rijervaring.",
      price: 2500,
      featured: false,
    },
    {
      id: "seed-pkg-standard",
      nameEn: "Standard",
      nameNl: "Standaard",
      descriptionEn: "Our most popular package — comprehensive training for confident drivers.",
      descriptionNl: "Ons populairste pakket — uitgebreide training voor zelfverzekerde bestuurders.",
      price: 3000,
      featured: true,
    },
    {
      id: "seed-pkg-premium",
      nameEn: "Premium",
      nameNl: "Premium",
      descriptionEn: "Intensive program designed to get you exam-ready in minimum time.",
      descriptionNl: "Intensief programma om je in minimale tijd examenklaar te maken.",
      price: 3500,
      featured: false,
    },
    {
      id: "seed-pkg-refresher",
      nameEn: "Refresher",
      nameNl: "Opfriscursus",
      descriptionEn: "Already know how to drive? Brush up your skills for the exam.",
      descriptionNl: "Kun je al autorijden? Fris je vaardigheden op voor het examen.",
      price: 650,
      featured: false,
    },
  ];

  for (const pkg of packageSeeds) {
    await prisma.package.upsert({
      where: { id: pkg.id },
      update: {},
      create: {
        id: pkg.id,
        nameEn: pkg.nameEn,
        nameNl: pkg.nameNl,
        descriptionEn: pkg.descriptionEn,
        descriptionNl: pkg.descriptionNl,
        price: pkg.price,
        currency: "SRD",
        lessonCount: 0,
        includesTheory: true,
        featured: pkg.featured,
        isActive: true,
      },
    });
  }

  const faqSeeds = [
    {
      question: "How many lessons do I need to pass my exam?",
      answer:
        "Most students pass after 15–20 lessons, depending on their prior experience. Our instructors will guide you and let you know when you're ready for the exam.",
      language: "EN" as const,
      orderIndex: 1,
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept cash payments at our location (Bonistraat 44) and bank transfers. After payment is confirmed by our admin, you'll receive a WhatsApp message with your course access details.",
      language: "EN" as const,
      orderIndex: 2,
    },
    {
      question: "Can I cancel or reschedule a lesson?",
      answer:
        "Yes! You can cancel or reschedule a lesson up to 24 hours before the scheduled time, directly from your student dashboard.",
      language: "EN" as const,
      orderIndex: 3,
    },
    {
      question: "Is the theory course available in Dutch?",
      answer:
        "Yes! Our full platform is available in both English and Dutch. You can switch languages at any time from your profile settings.",
      language: "EN" as const,
      orderIndex: 4,
    },
    {
      question: "Where are lessons conducted?",
      answer:
        "Lessons start and end at our school at Bonistraat 44, Paramaribo. Your instructor will drive through various routes around the city.",
      language: "EN" as const,
      orderIndex: 5,
    },
    {
      question: "Moet ik mijn eigen auto meenemen?",
      answer: "Nee — alle praktijklessen gebruiken onze volledig verzekerde lesauto's.",
      language: "NL" as const,
      orderIndex: 1,
    },
    {
      question: "Welke betaalmethoden accepteren jullie?",
      answer:
        "Wij accepteren contante betalingen op onze locatie (Bonistraat 44) en bankoverschrijvingen. Zodra de betaling is bevestigd, ontvang je een WhatsApp-bericht.",
      language: "NL" as const,
      orderIndex: 2,
    },
  ];

  for (const faq of faqSeeds) {
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question, language: faq.language },
    });
    if (!existing) {
      await prisma.fAQ.create({ data: faq });
    }
  }

  console.log({
    admin: admin.email,
    instructors: instructors.length,
    packages: packageSeeds.length,
    faqs: faqSeeds.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
