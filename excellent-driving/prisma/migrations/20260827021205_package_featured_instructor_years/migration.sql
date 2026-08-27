-- AlterTable
ALTER TABLE "instructors" ADD COLUMN     "yearsExperience" INTEGER;

-- AlterTable
ALTER TABLE "packages" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;
