import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { RegistrationsTable } from "@/components/dashboard/RegistrationsTable";
import { PAGE_SIZE } from "@/lib/constants";
import type { PaginatedResult, Student } from "@/types/api";

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; course?: string; gender?: string; discipline?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "STUDENT") redirect("/unauthorized");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (sp.course) qs.set("course", sp.course);
  if (sp.gender) qs.set("gender", sp.gender);
  if (sp.discipline) qs.set("discipline", sp.discipline);

  const result = await serverApiFetch<PaginatedResult<Student>>(`/students/registrations?${qs}`);

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Registrations</h2>
      <p className="mt-1 text-sm text-muted">Everyone who has registered, regardless of admission progress.</p>
      <RegistrationsTable
        registrations={result?.data ?? []}
        total={result?.total ?? 0}
        page={page}
        filters={{ course: sp.course ?? "", gender: sp.gender ?? "", discipline: sp.discipline ?? "" }}
      />
    </div>
  );
}
