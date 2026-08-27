import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const settings = await prisma.schoolSettings.upsert({
    where: { id: "school" },
    update: {},
    create: { id: "school" },
  });

  return (
    <SettingsForm
      initial={{
        schoolName: settings.schoolName,
        address: settings.address,
        phone: settings.phone,
        whatsappNumber: settings.whatsappNumber,
        whatsappBotEnabled: settings.whatsappBotEnabled,
        defaultLanguage: settings.defaultLanguage,
      }}
    />
  );
}
