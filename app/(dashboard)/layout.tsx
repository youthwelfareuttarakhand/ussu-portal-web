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

  // This portal is for staff/admin and for students who have actually been
  // ADMITTED — i.e. issued a UKSSU ID by staff approval, not merely
  // registered or paid the admission fee. Applicants mid-process (still
  // filling the form, paid but awaiting review, or rejected) are blocked
  // here and pointed back to the applicant dashboard on ussu-web instead.
  if (user.role === "STUDENT") {
    const admission = await serverApiFetch<Admission>("/admissions/me");
    const ukssuId = admission?.student.user.ukssuId ?? null;
    if (!ukssuId) {
      const message =
        admission?.status === "REJECTED"
          ? "Your admission application was not approved. Contact the admissions office for details."
          : admission?.paid
            ? "Your admission fee is paid and your application is awaiting staff review. You'll get portal access once approved and issued a UKSSU ID."
            : admission
              ? "Finish your admission form and pay the admission fee on the applicant dashboard to be considered for admission."
              : "Start your admission form on the applicant dashboard to be considered for admission.";
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface p-6">
          <div className="flex max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ClipboardList size={28} />
            </span>
            <h1 className="mt-6 font-display text-xl uppercase tracking-wide text-ink">Portal Access Not Yet Available</h1>
            <p className="mt-2 text-sm text-muted">{message}</p>
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
