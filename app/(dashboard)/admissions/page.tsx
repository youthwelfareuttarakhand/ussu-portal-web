import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { DataTable, StatusBadge } from "@/components/dashboard/DataTable";
import { AdmissionsQueueTable } from "@/components/dashboard/AdmissionsQueueTable";
import { Reveal } from "@/components/Reveal";
import { PAGE_SIZE } from "@/components/dashboard/Pagination";
import type { Admission, PaginatedResult } from "@/types/api";

export default async function AdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; course?: string; gender?: string; discipline?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (user.role === "STUDENT") {
    const admission = await serverApiFetch<Admission>("/admissions/me");
    return (
      <div>
        <h2 className="font-display text-lg uppercase tracking-wide text-ink">My Admission</h2>
        {!admission ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted">
            No admission application on file yet
          </p>
        ) : (
          <Reveal className="mt-4 max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div aria-hidden="true" className="h-1 w-full bg-gradient-to-r from-primary via-primary to-accent" />
            <div className="p-6">
              <p className="text-sm text-muted">Status</p>
              <div className="mt-2">
                <StatusBadge status={admission.status} />
              </div>
              <p className="mt-4 text-xs text-faint">
                Submitted {new Date(admission.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </Reveal>
        )}
      </div>
    );
  }

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (sp.course) qs.set("course", sp.course);
  if (sp.gender) qs.set("gender", sp.gender);
  if (sp.discipline) qs.set("discipline", sp.discipline);

  const result = await serverApiFetch<PaginatedResult<Admission>>(`/admissions?${qs}`);

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Admissions Queue</h2>
      <AdmissionsQueueTable
        admissions={result?.data ?? []}
        total={result?.total ?? 0}
        page={page}
        filters={{ course: sp.course ?? "", gender: sp.gender ?? "", discipline: sp.discipline ?? "" }}
      />
    </div>
  );
}
