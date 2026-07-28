import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import type { Admission } from "@/types/api";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  // Registering is not the same as completing admission — a student's UKSSU
  // ID and full portal access are issued the moment they finish the 5-step
  // admission form on ussu-web's dashboard and pay the admission fee
  // (Admission.paid), not on staff approval. Until then, show a holding page
  // pointing them back to the admission form instead of the real dashboard.
  if (user.role === "STUDENT") {
    const admission = await serverApiFetch<Admission>("/admissions/me");
    if (!admission?.paid) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface p-6">
          <div className="flex max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ClipboardList size={28} />
            </span>
            <h1 className="mt-6 font-display text-xl uppercase tracking-wide text-ink">Admission Not Yet Complete</h1>
            <p className="mt-2 text-sm text-muted">
              {admission
                ? "You still need to finish your admission form and pay the admission fee. You'll get full portal access — including your UKSSU ID — as soon as that's done."
                : "Finish your admission form on the applicant dashboard to unlock full portal access."}
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col md:ml-60">
        <Topbar email={user.email} role={user.role} title="USSU Portal" />
        <main className="min-h-screen flex-1 bg-surface p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
