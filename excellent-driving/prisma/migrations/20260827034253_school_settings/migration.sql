-- CreateTable
CREATE TABLE "school_settings" (
    "id" TEXT NOT NULL DEFAULT 'school',
    "schoolName" TEXT NOT NULL DEFAULT 'Excellent Driving',
    "address" TEXT NOT NULL DEFAULT 'Bonistraat 44, Paramaribo',
    "phone" TEXT NOT NULL DEFAULT '+597 XXX XXXX',
    "whatsappNumber" TEXT NOT NULL DEFAULT '',
    "whatsappBotEnabled" BOOLEAN NOT NULL DEFAULT false,
    "defaultLanguage" "Language" NOT NULL DEFAULT 'EN',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_settings_pkey" PRIMARY KEY ("id")
);
