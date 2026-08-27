import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { courseAccess: true },
  });

  if (!user?.courseAccess) {
    return (
      <div
        style={{
          background: "var(--white)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--gray-200)",
          padding: 32,
          textAlign: "center",
          color: "var(--gray-600)",
        }}
      >
        🔒 Your course access is currently on hold. Please contact the school to resolve this.
      </div>
    );
  }

  return <>{children}</>;
}
