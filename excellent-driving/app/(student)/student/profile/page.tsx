import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });

  return (
    <ProfileForm
      initialName={user!.name}
      email={user!.email}
      initialPhone={user!.phone ?? ""}
      initialLanguage={user!.language}
    />
  );
}
