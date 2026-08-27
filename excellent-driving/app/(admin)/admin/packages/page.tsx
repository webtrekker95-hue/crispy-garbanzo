import { prisma } from "@/lib/prisma";
import { PackagesManager } from "./packages-manager";

export default async function AdminPackagesPage() {
  const packages = await prisma.package.findMany({ orderBy: { price: "asc" } });

  return (
    <PackagesManager
      initial={packages.map((p) => ({
        id: p.id,
        nameEn: p.nameEn,
        nameNl: p.nameNl,
        descriptionEn: p.descriptionEn,
        descriptionNl: p.descriptionNl,
        price: Number(p.price),
        lessonCount: p.lessonCount,
        featured: p.featured,
        isActive: p.isActive,
      }))}
    />
  );
}
