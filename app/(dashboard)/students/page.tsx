import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { PAGE_SIZE } from "@/lib/constants";
import type { PaginatedResult, Student } from "@/types/api";

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "STUDENT") redirect("/unauthorized");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  // /students only returns students who've actually completed admission
  // (paid) — see StudentsService.findAll's comment. Applicants who've only
  // registered or started the admission form don't show up here.
  const result = await serverApiFetch<PaginatedResult<Student>>(
    `/students?page=${page}&limit=${PAGE_SIZE}`,
  );
  const students = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns: Column<Student>[] = [
    { header: "Email", accessor: (row) => row.user.email },
    { header: "UKSSU ID", accessor: (row) => row.user.ukssuId ?? "—" },
    { header: "Programme", accessor: (row) => row.programme ?? "—" },
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
      <div className="mt-4">
        <DataTable columns={columns} rows={students} emptyLabel="No students have completed admission yet" />
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <Link
            href={`/students?page=${page - 1}`}
            aria-disabled={page <= 1}
            className={`rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-ink ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            Previous
          </Link>
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/students?page=${page + 1}`}
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
