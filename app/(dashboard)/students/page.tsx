import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { StudentsTable } from "@/components/dashboard/StudentsTable";
import { PAGE_SIZE } from "@/lib/constants";
import type { PaginatedResult, Student } from "@/types/api";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; feeStatus?: string; course?: string; gender?: string; discipline?: string; search?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "STUDENT") redirect("/unauthorized");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  // /students only returns students who've actually completed admission
  // (assigned a UKSSU ID) — see StudentsService.findAll's comment.
  const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (sp.feeStatus) qs.set("feeStatus", sp.feeStatus);
  if (sp.course) qs.set("course", sp.course);
  if (sp.gender) qs.set("gender", sp.gender);
  if (sp.discipline) qs.set("discipline", sp.discipline);
  if (sp.search) qs.set("search", sp.search);
  const result = await serverApiFetch<PaginatedResult<Student>>(`/students?${qs}`);

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Students</h2>
      <p className="mt-1 text-sm text-muted">Applicants who have completed the admission process.</p>
      <StudentsTable
        students={result?.data ?? []}
        total={result?.total ?? 0}
        page={page}
        filters={{
          course: sp.course ?? "",
          gender: sp.gender ?? "",
          discipline: sp.discipline ?? "",
          search: sp.search ?? "",
          feeStatus: sp.feeStatus ?? "",
        }}
      />
    </div>
  );
}
