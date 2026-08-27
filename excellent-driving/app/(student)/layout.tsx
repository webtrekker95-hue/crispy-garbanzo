import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StudentShell } from "@/components/student-shell";
import "../(public)/public-shared.css";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return <StudentShell userName={session?.user?.name ?? "Student"}>{children}</StudentShell>;
}
