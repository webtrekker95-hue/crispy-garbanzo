import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminShell } from "@/components/admin-shell";
import "./admin-shared.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return <AdminShell adminName={session?.user?.name ?? "Admin"}>{children}</AdminShell>;
}
