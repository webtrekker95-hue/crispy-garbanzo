import { prisma } from "@/lib/prisma";
import { ContentManager } from "./content-manager";

export default async function AdminContentPage() {
  const modules = await prisma.module.findMany({
    include: { lessons: { orderBy: { orderIndex: "asc" } } },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <ContentManager
      initial={modules.map((m) => ({
        id: m.id,
        titleEn: m.titleEn,
        titleNl: m.titleNl,
        orderIndex: m.orderIndex,
        isPublished: m.isPublished,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          orderIndex: l.orderIndex,
          content: l.content as Record<string, unknown>,
        })),
      }))}
    />
  );
}
