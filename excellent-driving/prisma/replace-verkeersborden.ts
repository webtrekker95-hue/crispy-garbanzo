/**
 * One-off: turns the placeholder "Road Rules & Signs" module (seed-module-1)
 * on an already-seeded database into the real "Verkeersborden" module. The
 * seed only creates rows that don't exist yet, so it can't do this itself.
 *
 * Replaces the module's titles and all of its lessons (student progress on
 * the old placeholder lessons goes with them). Safe to run again.
 *
 *   DATABASE_URL=<session pooler URL> npx tsx prisma/replace-verkeersborden.ts
 */
import { PrismaClient } from "@prisma/client";
import { verkeersbordenLessons } from "./content/verkeersborden";

const MODULE_ID = "seed-module-1";
const prisma = new PrismaClient();

async function main() {
  const before = await prisma.lesson.count({ where: { moduleId: MODULE_ID } });
  await prisma.$transaction([
    prisma.module.update({ where: { id: MODULE_ID }, data: { titleEn: "Traffic Signs", titleNl: "Verkeersborden" } }),
    prisma.studentProgress.deleteMany({ where: { moduleId: MODULE_ID } }),
    prisma.lesson.deleteMany({ where: { moduleId: MODULE_ID } }),
    prisma.lesson.createMany({
      data: verkeersbordenLessons.map((lesson, i) => ({
        id: `${MODULE_ID}-lesson-${i + 1}`,
        moduleId: MODULE_ID,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        orderIndex: i + 1,
      })),
    }),
  ]);
  console.log({ module: MODULE_ID, lessonsBefore: before, lessonsAfter: verkeersbordenLessons.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
