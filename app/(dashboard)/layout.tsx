import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col">
        <Topbar email={user.email} role={user.role} title="USSU Portal" />
        <main className="flex-1 bg-surface p-6">{children}</main>
      </div>
    </div>
  );
}
