import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { StudentsFeeFilter } from "@/components/dashboard/StudentsFeeFilter";
import { PAGE_SIZE } from "@/lib/constants";
import type { PaginatedResult, Student } from "@/types/api";

const FEE_STATUS_BADGE_CLASS: Record<NonNullable<Student["feeStatus"]>, string> = {
  PAID: "bg-success/15 text-success",
  PARTIAL: "bg-warning/15 text-warning",
  UNPAID: "bg-accent/10 text-accent",
  NA: "bg-slate-100 text-faint",
};

const FEE_STATUS_LABEL: Record<NonNullable<Student["feeStatus"]>, string> = {
  PAID: "Paid",
  PARTIAL: "Partially Paid",
  UNPAID: "Unpaid",
  NA: "Not Applicable",
};

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ page?: string; feeStatus?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "STUDENT") redirect("/unauthorized");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const feeStatus = sp.feeStatus ?? "";

  // /students only returns students who've actually completed admission
  // (paid) — see StudentsService.findAll's comment. Applicants who've only
  // registered or started the admission form don't show up here.
  const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (feeStatus) qs.set("feeStatus", feeStatus);
  const result = await serverApiFetch<PaginatedResult<Student>>(`/students?${qs}`);
  const students = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (p: number) => {
    const params = new URLSearchParams({ page: String(p) });
    if (feeStatus) params.set("feeStatus", feeStatus);
    return `/students?${params.toString()}`;
  };

  const columns: Column<Student>[] = [
    { header: "Email", accessor: (row) => row.user.email },
    { header: "UKSSU ID", accessor: (row) => row.user.ukssuId ?? "—" },
    { header: "Programme", accessor: (row) => row.programme ?? "—" },
    {
      header: "Fees",
      accessor: (row) =>
        row.feeStatus ? (
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${FEE_STATUS_BADGE_CLASS[row.feeStatus]}`}>
            {FEE_STATUS_LABEL[row.feeStatus]}
          </span>
        ) : (
          "—"
        ),
    },
    {
      header: "",
      accessor: (row) =>
        row.admission ? (
          <Link href={`/admissions/${row.admission.id}`} className="text-xs font-bold uppercase tracking-wide text-primary hover:underline">
            View Admission Form
          </Link>
        ) : null,
    },
  ];

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Students</h2>
      <p className="mt-1 text-sm text-muted">Applicants who have completed the admission process.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <StudentsFeeFilter value={feeStatus} />
      </div>
      <div className="mt-4">
        <DataTable columns={columns} rows={students} emptyLabel="No students have completed admission yet" />
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <Link
            href={pageHref(page - 1)}
            aria-disabled={page <= 1}
            className={`rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-ink ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            Previous
          </Link>
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          <Link
            href={pageHref(page + 1)}
            aria-disabled={page >= totalPages}
            className={`rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-ink ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
