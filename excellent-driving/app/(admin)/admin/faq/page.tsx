import { prisma } from "@/lib/prisma";
import { FaqManager } from "./faq-manager";

export default async function AdminFaqPage() {
  const faqs = await prisma.fAQ.findMany({ orderBy: [{ language: "asc" }, { orderIndex: "asc" }] });
  return <FaqManager initial={faqs} />;
}
