import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-24 text-center">
      <p className="text-[var(--color-navy)]/60">
        Student dashboard — placeholder (AGENT 6, Phase 2).
      </p>
      <p className="text-sm text-[var(--color-navy)]/40">
        Signed in as {session?.user?.name} ({session?.user?.role})
      </p>
    </main>
  );
}
